import Fuse from "fuse.js";
import React from "react";
import { MergedReference } from "../utils";

enum Sorting {
  Ascending,
  Descending,
  Default = -1,
}

function nextSorting(sorting: Sorting): Sorting {
  switch (sorting) {
    case Sorting.Descending:
      return Sorting.Ascending;
    case Sorting.Ascending:
      return Sorting.Default;
    case Sorting.Default:
      return Sorting.Descending;
  }
}

interface ColumnHeadProps {
  key: string;
  selected: boolean;
  content: string;
  sorting: Sorting;
  onClick: React.MouseEventHandler;
}

function ColumnHead(props: ColumnHeadProps) {
  const { selected, sorting, content } = props;
  const [buttonContent, setButtonContent] = React.useState<string>();

  React.useEffect(() => {
    if (selected) {
      if (sorting === Sorting.Ascending) {
        setButtonContent(`${content} ⬇`);
      } else if (sorting === Sorting.Descending) {
        setButtonContent(`${content} ⬆`);
      } else {
        setButtonContent(content);
      }
    } else {
      setButtonContent(content);
    }
  }, [selected, sorting, content]);

  return (
    <th className="w-1/4 p-1" onClick={props.onClick}>
      <button
        type="button"
        className="cursor-pointer font-bold focus:outline-none hover:text-blue-800 focus:text-blue-800 dark:hover:text-blue-400 dark:focus:text-blue-400"
      >
        {buttonContent}
      </button>
    </th>
  );
}

interface LinkProps {
  href: string;
  content: string;
}

function Link(props: LinkProps) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline focus:outline-none hover:text-blue-800 focus:text-blue-800 dark:hover:text-blue-400 dark:focus:text-blue-400"
    >
      {props.content}
    </a>
  );
}

interface Column {
  key: keyof MergedReference;
  content: string;
}

interface TableRowProps {
  rowIndex: number;
  columns: Column[];
  reference: MergedReference;
}

function TableRow(props: TableRowProps) {
  return (
    <tr className="border odd:bg-gray-100 dark:odd:bg-gray-800 dark:border-gray-600">
      {props.columns.map((column, i) => {
        if (column.key === "title" && props.reference.href !== undefined) {
          return (
            <td key={`${props.rowIndex}-${i}`} className="p-2">
              <Link
                href={props.reference.href}
                content={props.reference.title}
              />
            </td>
          );
        }
        if (column.key === "episodes") {
          return (
            <td key={`${props.rowIndex}-${i}`} className="p-2">
              {props.reference.episodes
                .filter((episode, index) => {
                  const firstIndex = props.reference.episodes.findIndex(
                    (item) => item.title === episode.title
                  );
                  return firstIndex === index;
                })
                .map((episode) => (
                  <Link
                    key={episode.title}
                    href={episode.link}
                    content={episode.title}
                  />
                ))
                .reduce(
                  (array, current, index) => [
                    ...array,
                    index > 0 ? ", " : "",
                    current,
                  ],
                  [] as React.ReactNode[]
                )}
            </td>
          );
        }
        return (
          <td key={`${props.rowIndex}-${i}`} className="p-2">
            {props.reference[column.key]}
          </td>
        );
      })}
    </tr>
  );
}

const columns = [
  {
    key: "author",
    content: "Autor:innen",
  },
  { key: "title", content: "Titel" },
  { key: "publisher", content: "Verlage/Quellen" },
  { key: "episodes", content: "Episodentitel" },
] as Column[];

export interface TableProps {
  filterValue: string;
  references?: MergedReference[];
}

export function Table(props: TableProps) {
  const { references, filterValue } = props;
  const [selectedColumn, setSelectedColumn] =
    React.useState<keyof MergedReference>();
  const [sorting, setSorting] = React.useState<Sorting>(Sorting.Default);
  const [filteredReferences, setFilteredReferences] = React.useState<
    MergedReference[]
  >([]);
  const [sortedReferences, setSortedReferences] = React.useState<
    MergedReference[]
  >([]);
  const fuse = React.useRef<Fuse<MergedReference> | null>(null);

  React.useEffect(() => {
    if (typeof references !== "undefined" && references.length > 0) {
      fuse.current = new Fuse(references, {
        keys: columns.map((column) => column.key),
        minMatchCharLength: 2,
      });
    }
  }, [references]);

  React.useEffect(() => {
    if (typeof references !== "undefined") {
      if (
        filterValue.length > 2 &&
        fuse.current !== null &&
        references.length > 0
      ) {
        const result = fuse.current.search(filterValue);
        const items = result.map((element) => element.item);
        setFilteredReferences([...items]);
      } else if (filteredReferences.length !== references.length) {
        setFilteredReferences([...references]);
      }
    }
  }, [filterValue, references]); // eslint-disable-line

  React.useEffect(() => {
    if (sorting === Sorting.Default) {
      setSortedReferences([...filteredReferences]);
    } else if (typeof selectedColumn !== "undefined") {
      const sortedItems = [...filteredReferences].sort((a, b) => {
        const aContent =
          selectedColumn === "episodes"
            ? a[selectedColumn].map((item) => item.title).join(", ")
            : a[selectedColumn];
        const bContent =
          selectedColumn === "episodes"
            ? b[selectedColumn].map((item) => item.title).join(", ")
            : b[selectedColumn];
        if (typeof aContent !== "string" || typeof bContent !== "string") {
          return 0;
        }
        switch (sorting) {
          case Sorting.Descending:
            return aContent.localeCompare(bContent);
          case Sorting.Ascending:
            return bContent.localeCompare(aContent);
          default:
            return 0;
        }
      });
      setSortedReferences(sortedItems);
    }
  }, [sorting, filteredReferences, selectedColumn]);

  const handleColumnHeadClick: React.MouseEventHandler<Element> = (event) => {
    const columnButton = event.target as HTMLButtonElement;
    const { key } =
      columns.find((column) => {
        if (columnButton.textContent !== null) {
          return columnButton.textContent.includes(column.content); // includes `${column.content} ⬆`/`${column.content} ⬇`
        }
        return false;
      }) || {};
    if (key !== selectedColumn) {
      setSelectedColumn(key);
      setSorting(Sorting.Descending);
    } else {
      setSorting(nextSorting(sorting));
    }
  };

  return (
    <table className="w-full my-2 p-2 border-2 dark:border-gray-600">
      <thead>
        <tr className="border dark:border-gray-600">
          {columns.map((column) => {
            return (
              <ColumnHead
                key={column.key}
                content={column.content}
                selected={column.key === selectedColumn}
                sorting={sorting}
                onClick={handleColumnHeadClick}
              />
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedReferences.map((reference, index) => {
          return (
            <TableRow
              key={`${index}`}
              rowIndex={index}
              reference={reference}
              columns={columns}
            />
          );
        })}
      </tbody>
    </table>
  );
}

Table.defaultProps = {
  filterValue: "",
  references: [],
};

export default Table;
