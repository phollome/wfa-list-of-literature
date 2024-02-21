import { EnhancedReference } from "./App";

export interface Episode {
  title: string;
  pubDate: string;
  link: string;
}

export interface MergedReference {
  episodes: Episode[];
  author: string;
  title: string;
  publisher: string;
  href?: string;
}

export function mergeReferences(
  references: EnhancedReference[]
): MergedReference[] {
  const mergedReferences = references.reduce((array, reference) => {
    const index = array.findIndex(
      (item) =>
        item.author === reference.author &&
        item.title === reference.title &&
        item.publisher === reference.publisher
    );
    if (index === -1) {
      const base: MergedReference = {
        author: reference.author,
        title: reference.title,
        publisher: reference.publisher,
        episodes: [
          {
            title: reference.episodeTitle,
            pubDate: reference.episodePubDate,
            link: reference.episodeLink,
          },
        ],
      };
      if (reference.href !== undefined) {
        base.href = reference.href;
      }
      array.push(base);
    } else {
      array[index].episodes.push({
        title: reference.episodeTitle,
        pubDate: reference.episodePubDate,
        link: reference.episodeLink,
      });
    }
    return array;
  }, [] as MergedReference[]);
  return mergedReferences;
}
