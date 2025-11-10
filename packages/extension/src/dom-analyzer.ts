/**
 * Mr.Promth Extension - DOM Analyzer
 * 
 * This module analyzes the DOM structure of web pages
 */

export interface DOMNode {
  tag: string
  id?: string
  classes?: string[]
  attributes?: Record<string, string>
  text?: string
  children?: DOMNode[]
}

export interface ClickableElement {
  selector: string
  tag: string
  text: string
  href?: string
  type?: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface FormField {
  selector: string
  tag: string
  type: string
  name?: string
  id?: string
  placeholder?: string
  required: boolean
  value?: string
}

export interface DOMAnalysis {
  structure: DOMNode
  clickable: ClickableElement[]
  forms: FormField[]
  metadata: {
    title: string
    description?: string
    keywords?: string
    viewport?: string
    lang?: string
  }
}

export class DOMAnalyzer {
  /**
   * Analyze the current page DOM
   */
  analyze(): DOMAnalysis {
    const structure = this.analyzeNode(document.body)
    const clickable = this.findClickableElements()
    const forms = this.findFormFields()
    const metadata = this.extractMetadata()

    return {
      structure,
      clickable,
      forms,
      metadata,
    }
  }

  /**
   * Analyze a single DOM node
   */
  private analyzeNode(element: Element, depth: number = 0, maxDepth: number = 10): DOMNode {
    if (depth > maxDepth) {
      return {
        tag: element.tagName.toLowerCase(),
        text: '[too deep]',
      }
    }

    const node: DOMNode = {
      tag: element.tagName.toLowerCase(),
    }

    // Add ID
    if (element.id) {
      node.id = element.id
    }

    // Add classes
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(c => c)
      if (classes.length > 0) {
        node.classes = classes
      }
    }

    // Add important attributes
    const importantAttrs = ['href', 'src', 'alt', 'title', 'type', 'name', 'value', 'placeholder']
    const attributes: Record<string, string> = {}
    
    for (const attr of importantAttrs) {
      const value = element.getAttribute(attr)
      if (value) {
        attributes[attr] = value
      }
    }

    if (Object.keys(attributes).length > 0) {
      node.attributes = attributes
    }

    // Add text content (only direct text, not from children)
    const directText = Array.from(element.childNodes)
      .filter(child => child.nodeType === Node.TEXT_NODE)
      .map(child => child.textContent?.trim())
      .filter(text => text && text.length > 0)
      .join(' ')

    if (directText) {
      node.text = directText
    }

    // Add children (only important elements)
    const importantTags = new Set([
      'div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'span', 'a', 'button', 'input', 'textarea', 'select', 'form',
      'img', 'video', 'audio', 'canvas', 'svg',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
    ])

    const children: DOMNode[] = []
    
    for (const child of element.children) {
      if (importantTags.has(child.tagName.toLowerCase())) {
        children.push(this.analyzeNode(child, depth + 1, maxDepth))
      }
    }

    if (children.length > 0) {
      node.children = children
    }

    return node
  }

  /**
   * Find all clickable elements
   */
  private findClickableElements(): ClickableElement[] {
    const clickable: ClickableElement[] = []

    // Find all links
    document.querySelectorAll('a[href]').forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        clickable.push({
          selector: this.getSelector(el),
          tag: 'a',
          text: el.textContent?.trim() || '',
          href: el.getAttribute('href') || undefined,
          position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          },
        })
      }
    })

    // Find all buttons
    document.querySelectorAll('button').forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        clickable.push({
          selector: this.getSelector(el),
          tag: 'button',
          text: el.textContent?.trim() || '',
          type: el.getAttribute('type') || undefined,
          position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          },
        })
      }
    })

    // Find clickable inputs
    document.querySelectorAll('input[type="button"], input[type="submit"]').forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        clickable.push({
          selector: this.getSelector(el),
          tag: 'input',
          text: (el as HTMLInputElement).value || '',
          type: el.getAttribute('type') || undefined,
          position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          },
        })
      }
    })

    return clickable
  }

  /**
   * Find all form fields
   */
  private findFormFields(): FormField[] {
    const fields: FormField[] = []

    // Find all input fields
    document.querySelectorAll('input:not([type="button"]):not([type="submit"])').forEach(el => {
      const input = el as HTMLInputElement
      fields.push({
        selector: this.getSelector(el),
        tag: 'input',
        type: input.type || 'text',
        name: input.name || undefined,
        id: input.id || undefined,
        placeholder: input.placeholder || undefined,
        required: input.required,
        value: input.value || undefined,
      })
    })

    // Find all textareas
    document.querySelectorAll('textarea').forEach(el => {
      const textarea = el as HTMLTextAreaElement
      fields.push({
        selector: this.getSelector(el),
        tag: 'textarea',
        type: 'textarea',
        name: textarea.name || undefined,
        id: textarea.id || undefined,
        placeholder: textarea.placeholder || undefined,
        required: textarea.required,
        value: textarea.value || undefined,
      })
    })

    // Find all selects
    document.querySelectorAll('select').forEach(el => {
      const select = el as HTMLSelectElement
      fields.push({
        selector: this.getSelector(el),
        tag: 'select',
        type: 'select',
        name: select.name || undefined,
        id: select.id || undefined,
        required: select.required,
        value: select.value || undefined,
      })
    })

    return fields
  }

  /**
   * Extract page metadata
   */
  private extractMetadata() {
    const metadata: any = {
      title: document.title,
    }

    // Description
    const descMeta = document.querySelector('meta[name="description"]')
    if (descMeta) {
      metadata.description = descMeta.getAttribute('content') || undefined
    }

    // Keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]')
    if (keywordsMeta) {
      metadata.keywords = keywordsMeta.getAttribute('content') || undefined
    }

    // Viewport
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (viewportMeta) {
      metadata.viewport = viewportMeta.getAttribute('content') || undefined
    }

    // Language
    metadata.lang = document.documentElement.lang || undefined

    return metadata
  }

  /**
   * Generate CSS selector for an element
   */
  private getSelector(element: Element): string {
    // If element has ID, use it
    if (element.id) {
      return `#${element.id}`
    }

    // Build path from root
    const path: string[] = []
    let current: Element | null = element

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase()

      // Add class if available
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).filter(c => c)
        if (classes.length > 0) {
          selector += '.' + classes.join('.')
        }
      }

      // Add nth-child if needed
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children)
        const index = siblings.indexOf(current)
        if (siblings.length > 1) {
          selector += `:nth-child(${index + 1})`
        }
      }

      path.unshift(selector)
      current = current.parentElement
    }

    return path.join(' > ')
  }
}

// Export singleton instance
export const domAnalyzer = new DOMAnalyzer()
