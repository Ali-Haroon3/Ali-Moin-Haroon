const collapsibles = [...document.querySelectorAll('.collapsible')];
const expandToggle = document.getElementById('expandToggle');
const filters = [...document.querySelectorAll('.filter')];
const projects = [...document.querySelectorAll('.project')];

let expandedAll = false;

function setCardState(card, open) {
  card.classList.toggle('open', open);
  card.querySelector('.card-header').setAttribute('aria-expanded', String(open));
}

collapsibles.forEach((card) => {
  card.querySelector('.card-header').addEventListener('click', () => {
    const isOpen = card.classList.contains('open');
    setCardState(card, !isOpen);
  });
});

expandToggle.addEventListener('click', () => {
  expandedAll = !expandedAll;
  collapsibles.forEach((card) => setCardState(card, expandedAll));
  expandToggle.textContent = expandedAll ? 'Collapse all details' : 'Expand all details';
});

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((f) => f.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;

    projects.forEach((project) => {
      const tags = project.dataset.tags;
      const show = filter === 'all' || tags.includes(filter);
      project.style.display = show ? 'block' : 'none';
    });
  });
});

document.getElementById('year').textContent = new Date().getFullYear();
