import Page from '../components/Page';
import Reveal from '../components/Reveal';
import ButtonLink from '../components/ButtonLink';
import './NotFound.css';

export default function NotFound() {
  return (
    <Page title="Lost on the ridge — MistRoot Coffee">
      <section className="section page-top notfound">
        <div className="shell notfound__inner">
          <Reveal as="p" className="eyebrow eyebrow--bare">
            404 · Off the path
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="notfound__title">
              The cloud came in and <em>this page went with it.</em>
            </h1>
          </Reveal>
          <Reveal as="p" delay={0.16} className="lede notfound__lede">
            Nothing lives at that address. Head back to the ridge and start again.
          </Reveal>
          <Reveal delay={0.24}>
            <ButtonLink to="/">Back to MistRoot</ButtonLink>
          </Reveal>
        </div>
      </section>
    </Page>
  );
}
