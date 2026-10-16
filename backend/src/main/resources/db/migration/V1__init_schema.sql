CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    first_name VARCHAR(50) NOT NULL DEFAULT '',
    last_name VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(254),
    academic_group VARCHAR(32) NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocks (
    id SERIAL PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS committees (
    id SERIAL PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    block_id INTEGER REFERENCES blocks(id)
);

CREATE INDEX IF NOT EXISTS ix_committees_block_id ON committees(block_id);

CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    committee_id INTEGER NOT NULL REFERENCES committees(id),
    status VARCHAR(10) NOT NULL CONSTRAINT valid_status CHECK (status IN ('Intern', 'Member', 'Head')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_participants_committee_id ON participants(committee_id);
CREATE INDEX IF NOT EXISTS ix_participants_status ON participants(status);

CREATE TABLE IF NOT EXISTS role_assignments (
    telegram_id BIGINT NOT NULL CONSTRAINT positive_role_telegram_id CHECK (telegram_id > 0),
    role VARCHAR(16) NOT NULL CONSTRAINT valid_role CHECK (role IN ('admin', 'president', 'secretary', 'vice-president', 'head', 'member', 'trainee')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (telegram_id, role)
);

CREATE TABLE IF NOT EXISTS vice_president_blocks (
    telegram_id BIGINT NOT NULL,
    block_id INTEGER NOT NULL REFERENCES blocks(id),
    PRIMARY KEY (telegram_id, block_id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL CONSTRAINT valid_task_status CHECK (status IN ('CREATED', 'ASSIGNED', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED')),
    committee_id INTEGER REFERENCES committees(id),
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_tasks_committee_id ON tasks(committee_id);
CREATE INDEX IF NOT EXISTS ix_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS ix_tasks_assigned_to ON tasks(assigned_to);
