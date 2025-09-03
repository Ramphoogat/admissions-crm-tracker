import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { db } from "./db";
import type { Enquiry, ListEnquiriesResponse } from "./types";

interface ListEnquiriesParams {
  stage?: Query<string>;
  class?: Query<string>;
  q?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

// Retrieves all enquiries with optional filtering and pagination.
export const listEnquiries = api<ListEnquiriesParams, ListEnquiriesResponse>(
  { expose: true, method: "GET", path: "/enquiries" },
  async (params) => {
    const limit = Math.min(params.limit || 20, 100);
    const offset = Math.max(params.offset || 0, 0);
    
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.stage) {
      whereClause += ` AND stage = $${paramIndex}`;
      queryParams.push(params.stage);
      paramIndex++;
    }

    if (params.class) {
      whereClause += ` AND class_applied = $${paramIndex}`;
      queryParams.push(params.class);
      paramIndex++;
    }

    if (params.q?.trim()) {
      const searchTerm = `%${params.q.trim()}%`;
      whereClause += ` AND (student_name ILIKE $${paramIndex} OR guardian_name ILIKE $${paramIndex + 1} OR phone ILIKE $${paramIndex + 2})`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM enquiries ${whereClause}`;
    const countRow = await db.rawQueryRow<{ total: string }>(countQuery, ...queryParams);
    const total = parseInt(countRow?.total || "0", 10);

    // Get paginated results
    const dataQuery = `
      SELECT id, student_name, class_applied, guardian_name, phone, source, stage, notes, created_at
      FROM enquiries 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const items = await db.rawQueryAll<Enquiry>(dataQuery, ...queryParams);

    return { items, total };
  }
);
