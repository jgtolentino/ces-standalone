'use client'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid'

interface FilterOption {
  value: string
  label: string
  description?: string
}

interface FilterBarProps {
  filters: Record<string, string>
  onFilterChange: (filters: Record<string, string>) => void
  availableFilters: string[]
}

const filterConfig: Record<string, {
  label: string
  options: FilterOption[]
}> = {
  timeframe: {
    label: 'Time Period',
    options: [
      { value: '7d', label: 'Last 7 days', description: 'Weekly view' },
      { value: '30d', label: 'Last 30 days', description: 'Monthly view' },
      { value: '90d', label: 'Last 90 days', description: 'Quarterly view' },
      { value: '365d', label: 'Last year', description: 'Annual view' },
      { value: 'custom', label: 'Custom range', description: 'Pick dates' }
    ]
  },
  region: {
    label: 'Region',
    options: [
      { value: 'all', label: 'All Regions', description: 'National view' },
      { value: 'metro_manila', label: 'Metro Manila', description: 'NCR only' },
      { value: 'cebu', label: 'Cebu', description: 'Central Visayas' },
      { value: 'davao', label: 'Davao', description: 'Southern Mindanao' },
      { value: 'other', label: 'Other Regions', description: 'Rest of Philippines' }
    ]
  },
  role: {
    label: 'View As',
    options: [
      { value: 'executive', label: 'Executive', description: 'High-level KPIs' },
      { value: 'brand_manager', label: 'Brand Manager', description: 'Brand performance' },
      { value: 'regional_manager', label: 'Regional Manager', description: 'Geographic focus' },
      { value: 'analyst', label: 'Analyst', description: 'Detailed metrics' }
    ]
  },
  category: {
    label: 'Category',
    options: [
      { value: 'all', label: 'All Categories', description: 'Full catalog' },
      { value: 'electronics', label: 'Electronics', description: 'Tech products' },
      { value: 'fashion', label: 'Fashion', description: 'Clothing & accessories' },
      { value: 'home', label: 'Home & Garden', description: 'Household items' },
      { value: 'health', label: 'Health & Beauty', description: 'Personal care' },
      { value: 'food', label: 'Food & Beverage', description: 'Consumables' }
    ]
  },
  brand: {
    label: 'Brand',
    options: [
      { value: 'all', label: 'All Brands', description: 'Portfolio view' },
      { value: 'brand_a', label: 'Brand A', description: 'Premium line' },
      { value: 'brand_b', label: 'Brand B', description: 'Mass market' },
      { value: 'brand_c', label: 'Brand C', description: 'Digital-first' },
      { value: 'private_label', label: 'Private Label', description: 'Store brands' }
    ]
  }
}

export default function FilterBar({ filters, onFilterChange, availableFilters }: FilterBarProps) {
  const handleFilterUpdate = (filterKey: string, value: string) => {
    onFilterChange({ [filterKey]: value })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-sm font-medium text-gray-700">
          Filters:
        </div>
        
        {availableFilters.map((filterKey) => {
          const config = filterConfig[filterKey]
          if (!config) return null

          const currentValue = filters[filterKey] || config.options[0]?.value
          const currentOption = config.options.find(opt => opt.value === currentValue)

          return (
            <div key={filterKey} className="relative">
              <Listbox
                value={currentValue}
                onChange={(value) => handleFilterUpdate(filterKey, value)}
              >
                <div className="relative">
                  <Listbox.Button className="relative w-full min-w-[200px] cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">{config.label}</div>
                      <div className="font-medium text-gray-900">
                        {currentOption?.label || 'Select...'}
                      </div>
                    </div>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>

                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {config.options.map((option) => (
                        <Listbox.Option
                          key={option.value}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                            }`
                          }
                          value={option.value}
                        >
                          {({ selected }) => (
                            <>
                              <div>
                                <div className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {option.label}
                                </div>
                                {option.description && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          )
        })}

        {/* Quick Reset */}
        <button
          onClick={() => onFilterChange({
            timeframe: '30d',
            region: 'all',
            role: 'executive',
            category: 'all',
            brand: 'all'
          })}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reset filters
        </button>
      </div>
    </div>
  )
}