import CraftPlayer from "../sections/CraftPlayer";

/**
 * The making process on /craft: the same film-and-tabs player as the home page,
 * with each step’s longer account, who does it, how long it takes and a macro
 * photograph. Nothing pins; the steps play in turn or are chosen directly.
 */
export default function CraftSequence() {
  return (
    <CraftPlayer
      eyebrow="The five steps"
      headingId="steps-title"
      heading="Five steps, one bench"
      detailed
      className="bg-white screen-fit"
    />
  );
}
