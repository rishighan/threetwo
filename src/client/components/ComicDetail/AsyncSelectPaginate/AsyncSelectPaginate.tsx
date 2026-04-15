import React, { ReactElement, useCallback, useState } from "react";
import { fetchMetronResource } from "../../../actions/metron.actions";
import Creatable from "react-select/creatable";
import { withAsyncPaginate } from "react-select-async-paginate";

const CreatableAsyncPaginate = withAsyncPaginate(Creatable);

export interface AsyncSelectPaginateProps {
  metronResource?: string;
  placeholder?: string | React.ReactNode;
  value?: object;
  onChange?(...args: unknown[]): unknown;
  meta?: Record<string, unknown>;
  input?: Record<string, unknown>;
  name?: string;
  type?: string;
}

interface AdditionalType {
  page: number | null;
}

export const AsyncSelectPaginate = (props: AsyncSelectPaginateProps): ReactElement => {
  const [isAddingInProgress, setIsAddingInProgress] = useState(false);

  const loadData = useCallback(async (
    query: string,
    _loadedOptions: unknown,
    additional?: AdditionalType
  ) => {
    const page = additional?.page ?? 1;
    return fetchMetronResource({
      method: "GET",
      resource: props.metronResource || "",
      query: {
        name: query,
        page,
      },
    });
  }, [props.metronResource]);

  return (
    <CreatableAsyncPaginate
      debounceTimeout={200}
      isDisabled={isAddingInProgress}
      value={props.value}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      loadOptions={loadData as any}
      placeholder={props.placeholder}
      onChange={props.onChange}
      additional={{
        page: 1,
      }}
    />
  );
};

export default AsyncSelectPaginate;
