/**
 * Fuzzy Name Matching Utility to match extracted speaker names
 * e.g. "Rahul" -> "Rahul Sharma", "Priya" -> "Priya Patel"
 */

export function findBestMatchingEmployee<T extends { name: string }>(
  targetName: string,
  employees: T[]
): T | null {
  if (!targetName || employees.length === 0) return null;

  const cleanTarget = targetName.toLowerCase().trim();

  // 1. Exact match check
  const exactMatch = employees.find(
    (e) => e.name.toLowerCase().trim() === cleanTarget
  );
  if (exactMatch) return exactMatch;

  // 2. Starts with / Substring match check
  const partialMatch = employees.find(
    (e) =>
      e.name.toLowerCase().includes(cleanTarget) ||
      cleanTarget.includes(e.name.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  // 3. First name token match check (e.g. "Rahul (Lead)" -> "Rahul")
  const targetFirstToken = cleanTarget.split(" ")[0].replace(/[^a-z]/g, "");
  if (targetFirstToken.length >= 3) {
    const tokenMatch = employees.find((e) => {
      const empFirstToken = e.name.toLowerCase().split(" ")[0].replace(/[^a-z]/g, "");
      return empFirstToken === targetFirstToken;
    });
    if (tokenMatch) return tokenMatch;
  }

  // 4. Levenshtein distance fallback for minor typos
  let bestMatch: T | null = null;
  let minDistance = Infinity;

  for (const emp of employees) {
    const dist = levenshteinDistance(cleanTarget, emp.name.toLowerCase().trim());
    if (dist < minDistance && dist <= 3) {
      minDistance = dist;
      bestMatch = emp;
    }
  }

  return bestMatch;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
