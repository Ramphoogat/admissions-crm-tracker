import { api, APIError } from "encore.dev/api";
import { db } from "./db";
import type { CreateFollowUpRequest, CreateResponse } from "./types";

interface CreateFollowUpParams {
  id: number;
}

// Creates a follow-up for an enquiry.
export const createFollowUp = api<CreateFollowUpParams & CreateFollowUpRequest, CreateResponse>(
  { expose: true, method: "POST", path: "/enquiries/:id/followups" },
  async (req) => {
    const { id: enquiry_id, ...followUpData } = req;

    // Validate required fields
    if (!followUpData.due_on) {
      throw APIError.invalidArgument("due_on is required");
    }

    // Validate date format
    const dueDate = new Date(followUpData.due_on);
    if (isNaN(dueDate.getTime())) {
      throw APIError.invalidArgument("due_on must be a valid date");
    }

    // Check if enquiry exists
    const enquiryExists = await db.queryRow<{ id: number }>`
      SELECT id FROM enquiries WHERE id = ${enquiry_id}
    `;

    if (!enquiryExists) {
      throw APIError.notFound("enquiry not found");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO followups (enquiry_id, due_on, outcome, note)
      VALUES (${enquiry_id}, ${followUpData.due_on}, ${followUpData.outcome?.trim() || null}, ${followUpData.note?.trim() || null})
      RETURNING id
    `;

    if (!row) {
      throw APIError.internal("failed to create follow-up");
    }

    return { id: row.id };
  }
);
