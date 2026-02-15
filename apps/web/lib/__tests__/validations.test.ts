import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations";

describe("Validation Schemas", () => {
  describe("loginSchema", () => {
    it("validates correct login data", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("validates correct registration data", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "Password123",
        confirmPassword: "Password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short name", () => {
      const result = registerSchema.safeParse({
        name: "J",
        email: "john@example.com",
        password: "Password123",
        confirmPassword: "Password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects weak password", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "weak",
        confirmPassword: "weak",
      });
      expect(result.success).toBe(false);
    });

    it("rejects mismatched passwords", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "Password123",
        confirmPassword: "Different123",
      });
      expect(result.success).toBe(false);
    });

    it("requires uppercase, lowercase, and number", () => {
      const testCases = [
        { password: "alllowercase123", valid: false }, // no uppercase
        { password: "ALLUPPERCASE123", valid: false }, // no lowercase
        { password: "NoNumbersHere", valid: false }, // no numbers
        { password: "Valid123Pass", valid: true }, // all requirements met
      ];

      testCases.forEach(({ password, valid }) => {
        const result = registerSchema.safeParse({
          name: "John Doe",
          email: "john@example.com",
          password,
          confirmPassword: password,
        });
        expect(result.success).toBe(valid);
      });
    });
  });

  describe("forgotPasswordSchema", () => {
    it("validates correct email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("validates correct reset data", () => {
      const result = resetPasswordSchema.safeParse({
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const result = resetPasswordSchema.safeParse({
        password: "NewPassword123",
        confirmPassword: "Different123",
      });
      expect(result.success).toBe(false);
    });
  });
});
