CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  student_name TEXT NOT NULL,
  class_applied TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT,
  stage TEXT NOT NULL CHECK(stage IN ('new','contacted','scheduled','admitted','lost')) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE followups (
  id SERIAL PRIMARY KEY,
  enquiry_id INT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  due_on DATE NOT NULL,
  outcome TEXT,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_enquiries_stage ON enquiries(stage);
CREATE INDEX idx_enquiries_class ON enquiries(class_applied);
CREATE INDEX idx_followups_enquiry ON followups(enquiry_id);
