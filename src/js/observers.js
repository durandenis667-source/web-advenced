// IntersectionObserver voor kaartanimaties (fade-in bij scrollen)
export const setupCardReveal = (container) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('card--visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
  );

  container.querySelectorAll('.champion-card').forEach((card) => observer.observe(card));
  return observer;
};
