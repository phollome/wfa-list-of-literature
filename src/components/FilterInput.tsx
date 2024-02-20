import React from "react";

export interface FilterInputProps {
  children: React.ReactNode;
  inputProps: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
}

export const Id = "filter-input";

function FilterInput(props: FilterInputProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [value, setValue] = React.useState<string>();

  React.useEffect(() => {
    window.addEventListener("keydown", (evt) => {
      if ((evt.metaKey || evt.ctrlKey) && evt.key === "k") {
        if (inputRef.current !== null) {
          inputRef.current.focus();
        }
      }
    });
  }, []);

  const onChange = (evt) => {
    setValue(evt.target.value);
  };
  React.isValidElement(props.children);
  const elements = React.isValidElement(props.children)
    ? React.Children.toArray(props.children).map((child) =>
        React.cloneElement(child as React.ReactElement, {
          filterValue: value,
        })
      )
    : [];

  return (
    <>
      <label htmlFor={Id}>
        <input
          id={Id}
          data-testid={Id}
          ref={inputRef}
          className="w-full p-2 bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-600  border-2 rounded focus:border-gray-400 focus:outline-none"
          onChange={onChange}
          placeholder="Press ⌘K or ^K"
          aria-placeholder="Press Command K or Control K to filter"
          autoComplete="off"
          {...props.inputProps}
        />
      </label>
      {elements}
    </>
  );
}

FilterInput.defaultProps = {
  children: [],
  inputProps: {},
};

export default FilterInput;
