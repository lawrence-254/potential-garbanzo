import db from "../config/database";

export interface IUser {
  id?: number;
  username: string;
  email: string;
  password: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create a new user
export const createUser = (user: Omit<IUser, "id" | "createdAt" | "updatedAt">) => {
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password, displayName, bio, avatar)
    VALUES (@username, @email, @password, @displayName, @bio, @avatar)
  `);

  const result = stmt.run({
    username: user.username,
    email: user.email,
    password: user.password,
    displayName: user.displayName,
    bio: user.bio || "",
    avatar: user.avatar || "",
  });

  return result.lastInsertRowid;
};

// Find user by email
export const findUserByEmail = (email: string) => {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as IUser | undefined;
};

// Find user by username
export const findUserByUsername = (username: string) => {
  return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username) as IUser | undefined;
};

// Find user by ID
export const findUserById = (id: number) => {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as IUser | undefined;
};

// Update user
export const updateUser = (id: number, data: Partial<IUser>) => {
  const fields = Object.keys(data)
    .map((key) => `${key} = @${key}`)
    .join(", ");

  const stmt = db.prepare(`
    UPDATE users 
    SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
    WHERE id = @id
  `);

  return stmt.run({ ...data, id });
};