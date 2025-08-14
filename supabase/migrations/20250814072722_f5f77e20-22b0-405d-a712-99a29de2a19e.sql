-- Distribute questions across different point values (100, 200, 300, 400, 500)
-- This will cycle through point values for each category

WITH numbered_questions AS (
  SELECT 
    id,
    category_id,
    ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY created_at) as row_num
  FROM questions
),
point_assignment AS (
  SELECT 
    id,
    category_id,
    CASE 
      WHEN (row_num - 1) % 5 = 0 THEN 100
      WHEN (row_num - 1) % 5 = 1 THEN 200
      WHEN (row_num - 1) % 5 = 2 THEN 300
      WHEN (row_num - 1) % 5 = 3 THEN 400
      WHEN (row_num - 1) % 5 = 4 THEN 500
      ELSE 100
    END as new_points
  FROM numbered_questions
)
UPDATE questions 
SET points = point_assignment.new_points
FROM point_assignment
WHERE questions.id = point_assignment.id;