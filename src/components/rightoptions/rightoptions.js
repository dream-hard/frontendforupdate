import React from 'react';
import OptionSelector from './optionselector';
const RightOptions = ({onFilterChange,optionFilters,selectedFilters}) => {
  return (
    <div className='b-none '>
      <h5 className='pb-3 text-center shadow-sm rounded' style={{}}>خيارات التصفية</h5>
      {/* <OptionSelector /> */}
     {optionFilters.map((filter)=>(
      <OptionSelector
      key={filter.title}
      title={filter.title}
      options={filter.options}
      onChange={onFilterChange}
      selectedOptions={selectedFilters[filter.title]||[]}

      />
     ))}

      
      {/* Other filters... */}
    </div>
  );
};

export default RightOptions;
