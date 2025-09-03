import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { db } from "./db";
import type { SummaryResponse } from "./types";

interface SummaryParams {
  class?: Query<string>;
}

// Retrieves enquiry summary statistics by stage.
export const getSummary = api<SummaryParams, SummaryResponse>(
  { expose: true, method: "GET", path: "/reports/enquiries-summary" },
  async (params) => {
    let query = `
      SELECT stage, COUNT(*) as count 
      FROM enquiries 
    `;
    const queryParams: any[] = [];

    if (params.class) {
      query += ` WHERE class_applied = $1`;
      queryParams.push(params.class);
    }

    query += ` GROUP BY stage`;

    const rows = await db.rawQueryAll<{ stage: string; count: string }>(query, ...queryParams);
    
    const byStage: Record<string, number> = {
      new: 0,
      contacted: 0,
      scheduled: 0,
      admitted: 0,
      lost: 0
    };

    let total = 0;
    
    for (const row of rows) {
      const count = parseInt(row.count, 10);
      byStage[row.stage] = count;
      total += count;
    }

    return { byStage, total };
  }
);
