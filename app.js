const projects = [
  [95, 'Timber deck & wide steps', 'Outdoor living', 'Timber deck with broad steps and dark metal railings'],
  [93, 'Covered deck & stairway', 'Outdoor living', 'Covered timber deck with black railings and a central staircase'],
  [94, 'Elevated covered porch', 'Exterior improvements', 'Covered elevated wood porch alongside a home'],
  [92, 'Fireplace & built-ins', 'Interior details', 'Stone fireplace wall and dark cabinets with blue accent lighting, work in progress'],
  [96, 'Tiered backyard deck', 'Outdoor living', 'Low timber deck with tiered steps in a backyard'],
  [97, 'Elevated deck & stairs', 'Outdoor living', 'Elevated deck with white railings and stairs overlooking a yard']
];
const stage = document.querySelector('#gallery');
const ring = document.querySelector('#carousel-ring');
const dots = document.querySelector('#project-dots');
const playButton = document.querySelector('#play');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const stepAngle = 360 / projects.length;
let position = 0;
let playing = !reducedMotion.matches;
let timer;
let pointerStart = null;

projects.forEach(([id, title, category, alt], index) => {
  const card = document.createElement('article');
  card.className = 'project';
  card.style.setProperty('--angle', index * stepAngle + 'deg');
  card.setAttribute('role', 'group');
  card.setAttribute('aria-roledescription', 'slide');
  card.setAttribute('aria-label', (index + 1) + ' of ' + projects.length + ': ' + title);
  const photo = document.createElement('img');
  photo.src = 'assets/project-' + id + '.png';
  photo.alt = alt;
  photo.draggable = false;
  const caption = document.createElement('span');
  caption.className = 'card-number';
  caption.textContent = String(index + 1).padStart(2, '0');
  const cardLabel = document.createElement('div');
  cardLabel.className = 'card-label';
  const cardCategory = document.createElement('span');
  cardCategory.textContent = category;
  const cardTitle = document.createElement('h3');
  cardTitle.textContent = title;
  cardLabel.append(cardCategory, cardTitle);
  card.append(photo, caption, cardLabel);
  ring.append(card);

  const dot = document.createElement('button');
  dot.setAttribute('aria-label', 'Show ' + title);
  const thumbnail = document.createElement('img');
  thumbnail.src = 'assets/project-' + id + '.png';
  thumbnail.alt = '';
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  dot.append(thumbnail, number);
  dot.addEventListener('click', () => {
    const current = ((position % projects.length) + projects.length) % projects.length;
    let distance = index - current;
    if (distance > projects.length / 2) distance -= projects.length;
    if (distance < -projects.length / 2) distance += projects.length;
    move(distance);
  });
  dots.append(dot);
});

function render(announce = false) {
  const current = ((position % projects.length) + projects.length) % projects.length;
  ring.style.setProperty('--rotation', -position * stepAngle + 'deg');
  [...ring.children].forEach((card, index) => {
    const distance = Math.min((index - current + projects.length) % projects.length, (current - index + projects.length) % projects.length);
    card.dataset.distance = distance;
    card.setAttribute('aria-hidden', String(index !== current));
  });
  [...dots.children].forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === current)));
  document.querySelector('#project-count').textContent = String(current + 1).padStart(2, '0') + ' / 06';
  document.querySelector('#project-category').textContent = projects[current][2];
  document.querySelector('#project-title').textContent = projects[current][1];
  if (announce) document.querySelector('#carousel-announcement').textContent = projects[current][1] + ', ' + (current + 1) + ' of ' + projects.length;
}

function scheduleRotation() {
  clearInterval(timer);
  playButton.textContent = playing ? 'Ⅱ' : '▶';
  playButton.setAttribute('aria-label', playing ? 'Pause automatic rotation' : 'Start automatic rotation');
  if (playing && !document.hidden && !stage.matches(':hover') && (!document.querySelector('.projects').contains(document.activeElement) || document.activeElement === playButton)) {
    timer = setInterval(() => {
      position += 1;
      render();
    }, 4800);
  }
}

function move(distance) {
  position += distance;
  render(true);
  scheduleRotation();
}

document.querySelector('#prev').addEventListener('click', () => move(-1));
document.querySelector('#next').addEventListener('click', () => move(1));
playButton.addEventListener('click', () => {
  playing = !playing;
  scheduleRotation();
});
stage.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
stage.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  pointerStart = event.clientX;
  stage.setPointerCapture(event.pointerId);
  stage.classList.add('is-dragging');
  clearInterval(timer);
});
stage.addEventListener('pointermove', event => {
  if (pointerStart === null) return;
  const delta = event.clientX - pointerStart;
  ring.style.setProperty('--rotation', (-position * stepAngle + delta * .16) + 'deg');
});
stage.addEventListener('pointerup', event => {
  if (pointerStart === null) return;
  stage.classList.remove('is-dragging');
  const distance = pointerStart - event.clientX;
  pointerStart = null;
  if (Math.abs(distance) > 35) move(distance > 0 ? 1 : -1);
  else { render(); scheduleRotation(); }
});
stage.addEventListener('pointercancel', () => {
  stage.classList.remove('is-dragging');
  render();
  pointerStart = null;
  scheduleRotation();
});
stage.addEventListener('mouseenter', () => clearInterval(timer));
stage.addEventListener('mouseleave', scheduleRotation);
document.querySelector('.projects').addEventListener('focusin', () => clearInterval(timer));
document.querySelector('.projects').addEventListener('focusout', () => setTimeout(scheduleRotation, 0));
document.addEventListener('visibilitychange', scheduleRotation);
reducedMotion.addEventListener('change', () => {
  playing = !reducedMotion.matches;
  scheduleRotation();
});
new ResizeObserver(() => {
  const width = ring.offsetWidth;
  // For six faces, this radius leaves space between the photographs.
  stage.style.setProperty('--radius', Math.round(width * 1.04) + 'px');
}).observe(stage);
render();
scheduleRotation();

document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#status').textContent = 'Preview complete. Your inquiry has not been sent.';
});
