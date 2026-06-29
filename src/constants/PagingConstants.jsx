export const PAGING_ITEMS_PER_PAGE = 20;

export const PAGING_TITLE = 'Paging';

export const PAGING_TYPE_OPTIONS = ['one-way', 'two-way'];

/** Field tooltips for Paging */
export const PAGING_FIELD_TOOLTIPS = {
  name:
    'User-defined name of a paging group. It must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_ only. Maximum 32 characters.',

  number:
    'The number dialed to reach this paging group. The default range is 6200–6299 and can be modified in PBX → Preference → Extension Preferences. This field is empty by default and must be filled in, otherwise the configuration cannot be saved.',

  type:
    'Select the type of paging group. One-way: The paging group rings the selected extensions one by one. Two-way: The paging group rings the selected extensions one by one and the extensions can also ring back to the paging group.',

  caller_id_name_prefix:
    'The prefix of a caller ID name sent when the paging group rings. By default it is null.',

  member:
    'Select the member extensions to add to the paging group. Members are paged in the order shown in the Selected list.',
};
