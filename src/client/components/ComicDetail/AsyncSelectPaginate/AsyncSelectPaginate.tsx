import React, { ReactElement, useCallback, useState } from "react";
import { fetchMetronResource } from "../../../actions/metron.actions";
import Creatable from "react-select/creatable";
import { withAsyncPaginate } from "react-select-async-paginate";
const CreatableAsyncPaginate = withAsyncPaginate(Creatable);

interface AsyncSelectPaginateProps {
  metronResource: string;
  placeholder?: string;
  value?: object;
  onChange?(...args: unknown[]): unknown;
}

export const AsyncSelectPaginate = (props: AsyncSelectPaginateProps): ReactElement => {
  const [value, setValue] = useState(null);
  const [isAddingInProgress, setIsAddingInProgress] = useState(false);

  const loadData = useCallback((query, loadedOptions, { page }) => {
    return fetchMetronResource({
      method: "GET",
      resource: props.metronResource,
      query: {
        name: query,
        page,
      },
    });
  }, []);

  return (
    <CreatableAsyncPaginate
      SelectComponent={Creatable}
      debounceTimeout={200}
      isDisabled={isAddingInProgress}
      value={props.value}
      loadOptions={loadData}
      placeholder={props.placeholder}
      // onCreateOption={onCreateOption}
      onChange={props.onChange}
      // cacheUniqs={[cacheUniq]}
      additional={{
        page: 1,
      }}
    />
  );
};

export default AsyncSelectPaginate;
