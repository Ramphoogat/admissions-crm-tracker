import { api, APIError } from "encore.dev/api";
import { db } from "./db";
import type { UpdateEnquiryRequest, Enquiry } from "./types";

interface UpdateEnquiryParams {
  id: number;
}

// Updates an enquiry's stage, notes, class, or source.
export const updateEnquiry = api<UpdateEnquiryParams & UpdateEnquiryRequest, Enquiry>(
  { expose: true, method: "PATCH", path: "/enquiries/:id" },
  async (req) => {
    const { id, ...updateData } = req;

    // Validate at least one field is provided
    const allowedFields = ['stage', 'notes', 'class_applied', 'source'];
    const hasUpdates = allowedFields.some(field => updateData[field as keyof UpdateEnquiryRequest] !== undefined);
    
    if (!hasUpdates) {
      throw APIError.invalidArgument("at least one field must be provided for update");
    }

    // Validate stage if provided
    if (updateData.stage && !['new', 'contacted', 'scheduled', 'admitted', 'lost'].includes(updateData.stage)) {
      throw APIError.invalidArgument("invalid stage value");
    }

    // Build dynamic update query
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updateData.stage !== undefined) {
      setClauses.push(`stage = $${paramIndex}`);
      params.push(updateData.stage);
      paramIndex++;
    }

    if (updateData.notes !== undefined) {
      setClauses.push(`notes = $${paramIndex}`);
      params.push(updateData.notes?.trim() || null);
      paramIndex++;
    }

    if (updateData.class_applied !== undefined) {
      setClauses.push(`class_applied = $${paramIndex}`);
      params.push(updateData.class_applied.trim());
      paramIndex++;
    }

    if (updateData.source !== undefined) {
      setClauses.push(`source = $${paramIndex}`);
      params.push(updateData.source?.trim() || null);
      paramIndex++;
    }

    params.push(id);
    
    const query = `
      UPDATE enquiries 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, student_name, class_applied, guardian_name, phone, source, stage, notes, created_at
    `;

    const row = await db.rawQueryRow<Enquiry>(query, ...params);

    if (!row) {
      throw APIError.notFound("enquiry not found");
    }

    return row;
  }
);
