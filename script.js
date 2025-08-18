let count = 0;

const get = (k, d) => JSON.parse(localStorage.getItem(`rosary-${k}`)) ?? d;
const set = (k, v) => localStorage.setItem(`rosary-${k}`, JSON.stringify(v));

const increaseCount = () => {
  let { counts } = get('counts', {counts: 0});
  counts++;
  set('counts', {counts});
  document.querySelector("#count").innerText = counts;
}

function resetCount() {
  counts = 0;
  set('counts', {counts});
  document.querySelector("#count").innerText = counts;
}

(e => {
    let { counts } = get('counts', {counts: 0});
    document.querySelector("#count").innerText = counts;
})();