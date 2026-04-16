// Test calculateResult with string keys (what the frontend sends)
const answers_str = { "q1": "A", "q2": "B", "q3": "A", "q4": "C", "q5": "A" };
// What TypeScript sees: Record<string, AnswerValue>

// Simulate calculateResult logic
const q1 = answers_str["q1"] ?? answers_str[1] ?? "D";
const q2 = answers_str["q2"] ?? answers_str[2] ?? "A";
const q3 = answers_str["q3"] ?? answers_str[3] ?? "B";

console.log("q1:", q1, "q2:", q2, "q3:", q3);

let type;
if (q1 === "B" || q2 === "B" || q2 === "C" || q2 === "D" || q3 === "D") {
  type = "type_a";
} else if (q1 === "A") {
  type = "type_c";
} else {
  type = "type_b";
}
console.log("Result type:", type);

// Also test numeric keys
const answers_num = { 1: "A", 2: "B", 3: "A", 4: "C", 5: "A" };
const q1n = answers_num["q1"] ?? answers_num[1] ?? "D";
const q2n = answers_num["q2"] ?? answers_num[2] ?? "A";
const q3n = answers_num["q3"] ?? answers_num[3] ?? "B";
console.log("Numeric keys - q1:", q1n, "q2:", q2n, "q3:", q3n);
