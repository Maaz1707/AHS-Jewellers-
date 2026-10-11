import CraftPlayer from "../sections/CraftPlayer";
import TextLink from "../ui/TextLink";

/** The craft in one screen: a film and five steps that play in turn. */
export default function CraftStory() {
  return (
    <CraftPlayer
      eyebrow="The craft"
      headingId="craft-title"
      heading={
        <>
          From the bench,
          <br />
          by hand
        </>
      }
      footer={<TextLink href="/craft">Inside the workshop</TextLink>}
      className="bg-ivory screen-fit"
    />
  );
}
