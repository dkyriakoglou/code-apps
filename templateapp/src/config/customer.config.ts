export const customerConfig = {
  appTitle: 'Template App',
  brandColor: '#0078d4',

  stages: [
    { id: 1, name: 'Qualify',  description: 'Identify and qualify the opportunity' },
    { id: 2, name: 'Develop',  description: 'Define and develop the solution' },
    { id: 3, name: 'Propose',  description: 'Deliver the proposal' },
    { id: 4, name: 'Close',    description: 'Close and win the deal' },
  ],

  entityDisplayName: 'Opportunity',
  entityDisplayNamePlural: 'Opportunities',

  formFields: [
    { name: 'name',           label: 'Name',        type: 'text',      required: true  },
    { name: 'description',    label: 'Description', type: 'multiline', required: false },
    { name: 'estimatedvalue', label: 'Est. Value',  type: 'currency',  required: false },
    { name: 'closingdate',    label: 'Close Date',  type: 'date',      required: false },
  ],

  stageField: 'xen_stage',
};
