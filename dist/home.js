import { icon } from './ui.js';
export function homePage(){
  return `<div class="container home-dashboard simple-home">
    <header class="dashboard-hero"><h1>Pflege verstehen.<br>Den nächsten Schritt finden.</h1></header>
    <div class="home-bento task-bento">
      <a class="bento calculator-tile task-main" href="#/rechner"><div class="tile-top"><span class="icon-surface">${icon('calculator')}</span><span class="task-number" aria-hidden="true">01</span></div><div class="task-copy"><p class="tile-label">Pflegegrad herausfinden</p><h2>Welcher Pflegegrad<br>könnte mir zustehen?</h2></div><span class="button primary">Selbstcheck starten ${icon('arrow')}</span></a>
      <a class="bento apply-tile task-apply" href="#/ratgeber"><div class="tile-top"><span class="icon-surface">${icon('document')}</span><span class="task-number" aria-hidden="true">02</span></div><div class="task-copy"><p class="tile-label">Pflegegrad beantragen</p><h2>Wie bekomme ich<br>einen Pflegegrad?</h2></div><span class="task-link">Anleitung ansehen ${icon('arrow')}</span></a>
      <a class="bento benefits-tile task-benefits" href="#/leistungen"><div class="tile-top"><span class="icon-surface">${icon('wallet')}</span><span class="task-number" aria-hidden="true">03</span></div><div class="task-copy"><p class="tile-label">Leistungen & Budgets</p><h2>Welche Unterstützung<br>steht mir zu?</h2></div><span class="task-link">Leistungen ansehen ${icon('arrow')}</span></a>
    </div><p class="home-disclaimer">Der Selbstcheck gibt Orientierung und ersetzt keine offizielle Begutachtung.</p>
  </div>`;
}
