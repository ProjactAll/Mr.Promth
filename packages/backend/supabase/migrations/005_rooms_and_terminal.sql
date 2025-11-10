-- Migration: 005_rooms_and_terminal.sql
-- Description: Add Rooms and Terminal Sessions for Real-time Collaboration
-- Created: 2025-11-07

-- ============================================================================
-- 1. Create rooms table
-- ============================================================================

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('private', 'shared', 'public')) DEFAULT 'private',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rooms_owner_id ON rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);

-- ============================================================================
-- 2. Create room_members table
-- ============================================================================

CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);

-- ============================================================================
-- 3. Create terminal_sessions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS terminal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('active', 'idle', 'disconnected')) DEFAULT 'active',
  session_data JSONB DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_terminal_sessions_room_id ON terminal_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_terminal_sessions_user_id ON terminal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_terminal_sessions_status ON terminal_sessions(status);

-- ============================================================================
-- 4. Create terminal_messages table (for terminal history)
-- ============================================================================

CREATE TABLE IF NOT EXISTS terminal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES terminal_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message_type TEXT CHECK (message_type IN ('input', 'output', 'error', 'system')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_terminal_messages_session_id ON terminal_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_terminal_messages_created_at ON terminal_messages(created_at DESC);

-- ============================================================================
-- 5. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminal_messages ENABLE ROW LEVEL SECURITY;

-- Rooms Policies
CREATE POLICY "Users can view rooms they own or are members of"
  ON rooms FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = rooms.id
      AND room_members.user_id = auth.uid()
    ) OR
    type = 'public'
  );

CREATE POLICY "Users can create their own rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Room owners can update their rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Room owners can delete their rooms"
  ON rooms FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Room Members Policies
CREATE POLICY "Users can view members of rooms they belong to"
  ON room_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = room_members.room_id
      AND (
        rooms.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM room_members rm2
          WHERE rm2.room_id = rooms.id
          AND rm2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Room owners and admins can add members"
  ON room_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = room_members.room_id
      AND rooms.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = room_members.room_id
      AND rm.user_id = auth.uid()
      AND rm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Room owners and admins can update members"
  ON room_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = room_members.room_id
      AND rooms.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = room_members.room_id
      AND rm.user_id = auth.uid()
      AND rm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Room owners and admins can remove members"
  ON room_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = room_members.room_id
      AND rooms.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = room_members.room_id
      AND rm.user_id = auth.uid()
      AND rm.role IN ('owner', 'admin')
    ) OR
    user_id = auth.uid() -- Users can remove themselves
  );

-- Terminal Sessions Policies
CREATE POLICY "Users can view sessions in rooms they belong to"
  ON terminal_sessions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = terminal_sessions.room_id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions in rooms they belong to"
  ON terminal_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = terminal_sessions.room_id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own sessions"
  ON terminal_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Terminal Messages Policies
CREATE POLICY "Users can view messages in sessions they can access"
  ON terminal_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM terminal_sessions ts
      JOIN room_members rm ON rm.room_id = ts.room_id
      WHERE ts.id = terminal_messages.session_id
      AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their sessions"
  ON terminal_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM terminal_sessions ts
      JOIN room_members rm ON rm.room_id = ts.room_id
      WHERE ts.id = terminal_messages.session_id
      AND rm.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. Functions
-- ============================================================================

-- Function to update room updated_at timestamp
CREATE OR REPLACE FUNCTION update_room_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rooms
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_room_updated_at();

-- Function to update last_active_at for room members
CREATE OR REPLACE FUNCTION update_room_member_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE room_members
  SET last_active_at = NOW()
  WHERE room_id = NEW.room_id
  AND user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for terminal_sessions to update room member activity
CREATE TRIGGER update_member_activity_on_terminal_activity
  AFTER INSERT OR UPDATE ON terminal_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_room_member_activity();

-- Function to automatically add room owner as member
CREATE OR REPLACE FUNCTION add_room_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO room_members (room_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (room_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add owner as member when room is created
CREATE TRIGGER add_owner_as_member_on_room_create
  AFTER INSERT ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION add_room_owner_as_member();

-- ============================================================================
-- 7. Comments for documentation
-- ============================================================================

COMMENT ON TABLE rooms IS 'Stores collaboration rooms for terminal sessions';
COMMENT ON TABLE room_members IS 'Stores members of each room with their roles';
COMMENT ON TABLE terminal_sessions IS 'Stores active terminal sessions in rooms';
COMMENT ON TABLE terminal_messages IS 'Stores terminal message history';

COMMENT ON COLUMN rooms.type IS 'Room visibility: private, shared, or public';
COMMENT ON COLUMN room_members.role IS 'Member role: owner, admin, or member';
COMMENT ON COLUMN terminal_sessions.status IS 'Session status: active, idle, or disconnected';
COMMENT ON COLUMN terminal_messages.message_type IS 'Message type: input, output, error, or system';

-- ============================================================================
-- Migration complete
-- ============================================================================
