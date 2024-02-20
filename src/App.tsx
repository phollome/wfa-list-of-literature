import React from "react";
import {
  DarkModeSwitch,
  FilterInput,
  Table,
  type TableProps,
} from "./components";
import { useDarkMode } from "./hooks";
import data from "./assets/data.json";
import { MergedReference, mergeReferences } from "./utils";

interface Reference {
  author: string;
  title: string;
  publisher: string;
}

interface Episode {
  title: string;
  pubDate: string;
  href: string;
  references: Reference[];
}

interface Data {
  title: string;
  link: string;
  episodes: Episode[];
}

export interface EnhancedReference {
  episodeTitle: string;
  episodePubDate: string;
  episodeLink: string;
  author: string;
  title: string;
  publisher: string;
  href?: string;
}

function useReferences(data: Data) {
  const { title, link, episodes } = data;
  const [references, setReferences] = React.useState<MergedReference[]>();

  React.useEffect(() => {
    const collectedReferences = episodes
      .reduce((array, episode) => {
        const enhancedReferences = episode.references.map((reference) => {
          return {
            episodeTitle: episode.title,
            episodePubDate: episode.pubDate,
            episodeLink: episode.href,
            ...reference,
          };
        });
        return array.concat(enhancedReferences);
      }, [] as EnhancedReference[])
      .sort((a, b) => {
        return (
          new Date(b.episodePubDate).getTime() -
          new Date(a.episodePubDate).getTime()
        );
      });
    const mergedReferences = mergeReferences(collectedReferences);
    setReferences(mergedReferences);
  }, [title, link, episodes]);

  return references;
}

export function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const references = useReferences(data);

  return (
    <div className="min-w-min min-h-screen bg-white dark:bg-gray-900">
      <div className="m-auto min-w-min max-w-7xl text-gray-900 dark:text-gray-300">
        <header className="p-4 text-center">
          <div className="text-right">
            <DarkModeSwitch isDarkMode={isDarkMode} onChange={toggleDarkMode} />
          </div>
          <h1 className="text-4xl font-bold">
            <a
              href={data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline focus:outline-none hover:text-blue-800 focus:text-blue-800 dark:hover:text-blue-400 dark:focus:text-blue-400"
            >
              {data.title}
            </a>
          </h1>
          <h2 className="text-xl">Literaturverzeichnis</h2>
        </header>
        <main className="m-2">
          <FilterInput
            inputProps={{
              placeholder: "🔎  Drücke ⌘ + K oder ^ + K",
              "aria-label": "Drücke Command + K oder Steuerung + K zum filtern",
            }}
          >
            <Table {...({ references } as TableProps)} />
          </FilterInput>
        </main>
        <footer className="py-2 text-center">
          <a
            href="https://songsforthe.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="underline focus:outline-none hover:text-blue-800 focus:text-blue-800 dark:hover:text-blue-400 dark:focus:text-blue-400"
          >
            Impressum
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
