import { api, APIError } from "encore.dev/api";
import { db } from "./db";
import type { CreateEnquiryRequest, CreateResponse } from "./types";

// Creates a new enquiry.
export const createEnquiry = api<CreateEnquiryRequest, CreateResponse>(
  { expose: true, method: "POST", path: "/enquiries" },
  async (req) => {
    // Validate required fields
    if (!req.student_name?.trim()) {
      throw APIError.invalidArgument("student_name is required");
    }
    if (!req.class_applied?.trim()) {
      throw APIError.invalidArgument("class_applied is required");
    }
    if (!req.guardian_name?.trim()) {
      throw APIError.invalidArgument("guardian_name is required");
    }
    if (!req.phone?.trim()) {
      throw APIError.invalidArgument("phone is required");
    }

    // Validate phone format
    const phonePattern = /^[0-9+\-\s]{7,15}$/;
    const trimmedPhone = req.phone.trim();
    if (!phonePattern.test(trimmedPhone)) {
      throw APIError.invalidArgument("phone must be 7-15 characters with numbers, +, -, or spaces only");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO enquiries (student_name, class_applied, guardian_name, phone, source, notes)
      VALUES (${req.student_name.trim()}, ${req.class_applied.trim()}, ${req.guardian_name.trim()}, 
              ${trimmedPhone}, ${req.source?.trim() || null}, ${req.notes?.trim() || null})
      RETURNING id
    `;

    if (!row) {
      throw APIError.internal("failed to create enquiry");
    }

    return { id: row.id };
  }
);
