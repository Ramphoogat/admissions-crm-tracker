import { api, APIError } from "encore.dev/api";
import { db } from "./db";
import type { FollowUp } from "./types";

interface GetFollowUpsParams {
  id: number;
}

interface GetFollowUpsResponse {
  followups: FollowUp[];
}

// Retrieves all follow-ups for an enquiry.
export const getFollowUps = api<GetFollowUpsParams, GetFollowUpsResponse>(
  { expose: true, method: "GET", path: "/enquiries/:id/followups" },
  async (params) => {
    // Check if enquiry exists
    const enquiryExists = await db.queryRow<{ id: number }>`
      SELECT id FROM enquiries WHERE id = ${params.id}
    `;

    if (!enquiryExists) {
      throw APIError.notFound("enquiry not found");
    }

    const followups = await db.queryAll<FollowUp>`
      SELECT id, enquiry_id, due_on, outcome, note, created_at
      FROM followups 
      WHERE enquiry_id = ${params.id}
      ORDER BY due_on ASC, created_at DESC
    `;

    return { followups };
  }
);
