import { describe, expect, it } from "vitest";

import { prepareArticleContentForNavigation } from "./article-content";

describe("prepareArticleContentForNavigation", () => {
  it("derives stable anchors and nested navigation labels from article headings", () => {
    const source = `
      <section>
        <h2 id="kurzantwort">Kurzantwort</h2>
        <h2>Prüfungsanbieter im Detail</h2>
        <div class="prov-card" id="prov-goethe">
          <div class="prov-header">
            <p class="prov-title">Goethe-Institut — Goethe-Zertifikat</p>
          </div>
        </div>
      </section>
    `;

    const first = prepareArticleContentForNavigation(source);
    const second = prepareArticleContentForNavigation(source);

    expect(first).toEqual(second);
    expect(first.tableOfContents).toEqual([
      { id: "kurzantwort", label: "Kurzantwort", level: 2 },
      {
        id: "artikel-pruefungsanbieter-im-detail",
        label: "Prüfungsanbieter im Detail",
        level: 2,
      },
      {
        id: "artikel-goethe-institut-goethe-zertifikat",
        label: "Goethe-Institut — Goethe-Zertifikat",
        level: 3,
      },
    ]);
    expect(first.content).toContain(
      '<h3 class="prov-title" id="artikel-goethe-institut-goethe-zertifikat" data-article-toc-heading="true">',
    );
  });

  it("adds CEFR badges to level-card navigation labels without duplicating visible text", () => {
    const source = `
      <h2>Niveaustufen im Detail</h2>
      <div class="level-card" id="lv-b2">
        <div class="card-header">
          <div class="level-badge">B2</div>
          <p class="card-title">Fließend und flexibel</p>
        </div>
      </div>
    `;

    const prepared = prepareArticleContentForNavigation(source);

    expect(prepared.tableOfContents[1]).toEqual({
      id: "artikel-b2-fliessend-und-flexibel",
      label: "B2 – Fließend und flexibel",
      level: 3,
    });
    expect(prepared.content).toContain(
      '>Fließend und flexibel</h3>',
    );
    expect(prepared.content).not.toContain(
      '>B2 – Fließend und flexibel</h3>',
    );
  });
});
