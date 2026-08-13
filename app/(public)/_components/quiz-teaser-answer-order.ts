export function shuffleQuizAnswers<T>(
  answers: readonly T[],
  random: () => number = Math.random,
): T[] {
  const shuffled = [...answers];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  const orderDidNotChange =
    shuffled.length > 1 && shuffled.every((answer, index) => answer === answers[index]);
  if (orderDidNotChange) {
    shuffled.push(shuffled.shift() as T);
  }

  return shuffled;
}
