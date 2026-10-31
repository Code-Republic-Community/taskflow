import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import type { RegisterInput } from "../../../types/authTypes";
import "./authForm.css";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage, getFieldErrors } from "../../../api/client";
import { useAuth } from "../useAuth";

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>();

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => navigate("/projects"),
    onError: (error) => {
      Object.entries(getFieldErrors(error)).forEach(([field, message]) => {
        setError(field as keyof RegisterInput, { type: "server", message });
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    registerMutation.mutate(data);
  });

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={onSubmit} noValidate>
        <header className="auth__header">
          <span className="auth__logo" aria-hidden="true">
            T
          </span>
          <h1 className="auth__title">Create your account</h1>
          <p className="auth__subtitle">Start planning and shipping with TaskFlow.</p>
        </header>

        <div className="auth__field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            aria-invalid={!!errors.name}
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="auth__error" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="auth__field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
            })}
          />
          {errors.email && (
            <p className="auth__error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="auth__field">
          <label htmlFor="password">Password</label>
          <div className="auth__password">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={!!errors.password}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
              })}
            />
            <button
              type="button"
              className="auth__toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="auth__error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {registerMutation.isError && (
          <p className="auth__error" role="alert">
            {getErrorMessage(registerMutation.error)}
          </p>
        )}

        <button type="submit" className="auth__submit" disabled={registerMutation.isPending}>
          Create account
        </button>

        <p className="auth__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
};
