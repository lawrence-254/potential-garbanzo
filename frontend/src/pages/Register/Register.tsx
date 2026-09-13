import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button/Button";
import { registerUser } from "../../services/api/authApi";
import "./Register.css";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    displayName: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.displayName
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

   try {
  setLoading(true);

  await registerUser(form);

  navigate("/login");
}  catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register__card">
        <div className="register__brand">
          <div className="register__logo">R</div>
          <h1>Join Royal</h1>
          <p>Create your account and connect with your community.</p>
        </div>

        <form className="register__form" onSubmit={handleSubmit}>
          {error && (
            <div className="register__error" role="alert">
              {error}
            </div>
          )}

          <div className="register__field">
            <label htmlFor="displayName">Display name</label>
            <input
              id="displayName"
              type="text"
              value={form.displayName}
              onChange={(event) =>
                handleChange("displayName", event.target.value)
              }
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div className="register__field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={(event) =>
                handleChange("username", event.target.value)
              }
              placeholder="yourusername"
              autoComplete="username"
            />
          </div>

          <div className="register__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) =>
                handleChange("email", event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="register__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) =>
                handleChange("password", event.target.value)
              }
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="register__login">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}