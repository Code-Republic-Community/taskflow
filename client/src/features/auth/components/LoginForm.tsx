import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import type { LoginInput } from "../../../types/authTypes";
import "./authForm.css";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage, getFieldErrors } from "../../../api/client";
import { useAuth } from "../useAuth";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login: loginUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => navigate("/projects"),
    onError: (error) => {
      Object.entries(getFieldErrors(error)).forEach(([field, message]) => {
        setError(field as keyof LoginInput, { type: "server", message });
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={onSubmit} noValidate>
        <header className="auth__header">
          <span className="auth__logo" aria-hidden="true">
            T
          </span>
          <h1 className="auth__title">Sign in to TaskFlow</h1>
          <p className="auth__subtitle">Welcome back.</p>
        </header>

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
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password", {
                required: "Password is required",
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

        {loginMutation.isError && (
          <p className="auth__error" role="alert">
            {getErrorMessage(loginMutation.error)}
          </p>
        )}

        <button type="submit" className="auth__submit" disabled={loginMutation.isPending}>
          Sign In
        </button>

        <p className="auth__footer">
          Don't have an account yet? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </main>
  );
};
