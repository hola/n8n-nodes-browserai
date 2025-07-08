import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeOperationError, } from 'n8n-workflow';

export class BrowserAi implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'BrowserAI',
        name: 'BrowserAi',
        icon: 'file:favicon.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Interact with the BrowserAI API',
        defaults: {
            name: 'browserai',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'browseraiApi',
                required: true,
            },
        ],
        requestDefaults: {
            baseURL: 'https://browser.ai/api/v1/',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        },
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    { name: 'Create Saved Task', value: 'createSavedTask' },
                    { name: 'Create Task', value: 'tasks' },
                    { name: 'Get List of Saved Tasks', value: 'getSavedTaskList' },
                    { name: 'Get Saved Task by Name', value: 'getSavedTaskByName' },
                    { name: 'Get Task Metadata', value: 'getTaskMetadata' },
                    { name: 'Get Task Results', value: 'getTaskResults' },
                    { name: 'Stop Task', value: 'stopTask' },
                ],
                default: 'tasks',
                noDataExpression: true,
            },
            {
                displayName: 'Session ID',
                name: 'sessionId',
                type: 'string',
                default: '',
                description: 'Session ID of the task',
                displayOptions: {
                    show: {
                        operation: ['stopTask', 'getTaskMetadata', 'getTaskResults'],
                    },
                },
                routing: {
                    request: {
                        url: '=/tasks/{{$value}}',
                    },
                },
            },
            {
                displayName: 'Command',
                name: 'command',
                type: 'options',
                default: 'stop',
                noDataExpression: true,
                options: [{ name: 'Stop', value: 'stop' }],
                displayOptions: {
                    show: {
                        operation: ['stopTask'],
                    },
                },
                routing: {
                    request: {
                        url: '=/tasks/{{$parameter.sessionId}}/command',
                        body: {
                            command: '={{$value}}',
                        },
                    },
                },
            },
            {
                displayName: 'Project',
                name: 'project',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['tasks', 'createSavedTask'],
                    },
                },
                routing: {
                    request: {
                        body: {
                            project: '={{$value}}',
                        },
                    },
                },
            },
            {
                displayName: 'Task Name',
                name: 'name',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['createSavedTask', 'getSavedTaskByName'],
                    },
                },
                routing: {
                    request: {
                        url: '=/saved_tasks/name/{{$value}}',
                        body: {
                            name: '={{$value}}',
                        },
                    },
                },
            },
            {
                displayName: 'Country',
                name: 'country',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['tasks', 'createSavedTask'],
                    },
                },
                routing: {
                    request: {
                        body: {
                            geoLocation: {
                                country: '={{$value}}',
                            },
                        },
                    },
                },
            },
            {
                displayName: 'City',
                name: 'city',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['tasks', 'createSavedTask'],
                    },
                },
                routing: {
                    request: {
                        body: {
                            geoLocation: {
                                city: '={{$value}}',
                            },
                        },
                    },
                },
            },
            {
                displayName: 'Zipcode',
                name: 'zipcode',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['tasks', 'createSavedTask'],
                    },
                },
                routing: {
                    request: {
                        body: {
                            geoLocation: {
                                zipcode: '={{$value}}',
                            },
                        },
                    },
                },
            },
            {
                displayName: 'Task Type',
                name: 'type',
                type: 'options',
                default: 'crawler_automation',
                noDataExpression: true,
                options: [
                    { name: 'Crawler Automation', value: 'crawler_automation' },
                    { name: 'Script Automation', value: 'script_automation' }
                ],
                displayOptions: {
                    show: {
                        operation: ['tasks', 'createSavedTask'],
                    },
                },
                routing: {
                    request: {
                        body: {
                            type: '={{$value}}',
                        },
                    },
                },
            },
            {
                displayName: 'Enable Inspection',
                name: 'inspect',
                type: 'boolean',
                default: false,
                noDataExpression: true,
                displayOptions: {
                    show: {
                        operation: ['tasks'],
                    },
                },
                routing: {
                    request: {
                        body: {
                            inspect: '={{$value}}',
                        },
                    },
                },
            },
            {
                displayName: 'Instructions',
                name: 'instructions',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: {},
                options: [
                    {
                        name: 'instruction',
                        displayName: 'Instruction',
                        values: [
                            {
                                displayName: 'Action',
                                name: 'action',
                                type: 'string',
                                default: '',
                            },
                        ],
                    },
                ],
                displayOptions: {
                    show: {
                        operation: ['tasks', 'createSavedTask'],
                    },
                },
                routing: {
                    request: {
                        body: {
                            instructions: '={{$value.instruction}}',
                        },
                    },
                },
            },
            {
                displayName: 'Cron Settings',
                name: 'cron_settings',
                type: 'string',
                default: '',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        operation: ['createSavedTask'],
                    },
                },
                routing: {
                    request: {
                        body: {
                            cron_settings: '={{$value}}',
                        },
                    },
                },
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const operation = this.getNodeParameter('operation', 0) as string;

        const baseUrl = 'https://browser.ai/api/v1/';

        const endpointMap: Record<string, string> = {
            tasks: 'tasks',
            stopTask: 'tasks',
            getTaskMetadata: 'tasks',
            getTaskResults: 'tasks',
            createSavedTask: 'saved_tasks',
            getSavedTaskList: 'saved_tasks',
            getSavedTaskByName: 'saved_tasks/name',
        };

        const methodMap: Record<string, 'GET' | 'POST'> = {
            tasks: 'POST',
            stopTask: 'POST',
            getTaskMetadata: 'GET',
            getTaskResults: 'GET',
            createSavedTask: 'POST',
            getSavedTaskList: 'GET',
            getSavedTaskByName: 'GET',
        };

        const operationParamsMap: Record<string, string[]> = {
            tasks: ['project', 'country', 'city', 'zipcode', 'type', 'instructions', 'inspect'],
            stopTask: ['sessionId', 'command'],
            getTaskMetadata: ['sessionId'],
            getTaskResults: ['sessionId'],
            createSavedTask: ['project', 'name', 'country', 'city', 'zipcode', 'type', 'instructions', 'cron_settings'],
            getSavedTaskList: [],
            getSavedTaskByName: ['name'],
        };

        const endpoint = endpointMap[operation];
        const method = methodMap[operation] || 'POST';

        if (!endpoint) {
            throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
        }

        // Get credentials
        const credentials = await this.getCredentials('browseraiApi');
        const apiKey = credentials.apiKey as string;

        for (let i = 0; i < items.length; i++) {
            const body: Record<string, any> = {};
            const keys = operationParamsMap[operation] || [];

            let geoLocation: Record<string, string | undefined> = {};

            for (const key of keys) {
                const value = this.getNodeParameter(key, i, false);
                if (value !== undefined && value !== null && value !== '') {
                    if (key === 'instructions') {
                        const instructions = (value as any).instruction || [];
                        body.instructions = instructions.map((inst: any) => ({
                            action: inst.action,
                        }));
                    } else if (['country', 'city', 'zipcode'].includes(key)) {
                        geoLocation[key] = value as string;
                    } else {
                        body[key] = value;
                    }
                }
            }

            // Add geoLocation only if country is provided (required)
            if (geoLocation.country) {
                body.geoLocation = geoLocation;
            } else if (['tasks', 'createSavedTask'].includes(operation)) {
                throw new NodeOperationError(this.getNode(), 'Country is required to build geoLocation.');
            }

            // Build dynamic URL
            let url = `${baseUrl}${endpoint}`;

            if (operation === 'stopTask') {
                const sessionId = this.getNodeParameter('sessionId', i);
                url = `${baseUrl}tasks/${sessionId}/command`;
            } else if (operation === 'getTaskMetadata') {
                const sessionId = this.getNodeParameter('sessionId', i);
                url = `${baseUrl}tasks/${sessionId}`;
            } else if (operation === 'getTaskResults') {
                const sessionId = this.getNodeParameter('sessionId', i);
                url = `${baseUrl}results/${sessionId}`;
            } else if (operation === 'getSavedTaskByName') {
                const name = this.getNodeParameter('name', i);
                url = `${baseUrl}saved_tasks/name/${name}`;
            }

            // Prepare request
            const requestOptions: Record<string, any> = {
                method,
                url,
                headers: {
                    Authorization: `apikey ${apiKey}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                json: true,
            };

            if (method === 'POST') {
                requestOptions.body = body;
            }

            // Send request
            const response = await this.helpers.request(requestOptions);
            returnData.push({ json: response });
        }
        return [returnData];
    }
}
