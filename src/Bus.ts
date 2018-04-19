import { Message, MessageBus, MessageHandler, MessageValidator, Command, CommandHandler, CommandValidator, Query, QueryHandler, QueryValidator, Event, EventHandler } from './Contracts';
import { MessageBusException } from './Exceptions';
import { stringify } from 'querystring';

export class HandlerAndValidator {
    public messageHandler: MessageHandler;
    public messageValidator: MessageValidator;
    constructor() {
        this.messageHandler = new MessageHandler();
        this.messageValidator = new MessageValidator();
    }
}

//bus factory que em garanteixi singleton de bus i em registra tots els handlers i validadors
export class Bus implements MessageBus {

    public bus = new Map<string, HandlerAndValidator>();

    public execute(message: Message): Promise<any> {
        const messageName = this.getObjectName(message);
        const aux = this.bus.get(messageName);
        const handler: MessageHandler = aux.messageHandler;

        if (!handler) {
            return Promise.reject(new MessageBusException(`Can not find handler for ${messageName}`));
        }
        if (messageName.includes('Command' || 'Query')) {
            const validator: MessageValidator = aux.messageValidator;
            if (!validator) {
                return Promise.reject(new MessageBusException(`Can not find validator for ${messageName}`));
            }
            if (!(validator.isValid(message))) {
                return Promise.reject(new MessageBusException(`Can not validate for ${messageName}`));
            }
        }

        return handler.handle(message);
    }

    public addMessages(messages: Array<string>) {
        for (var message in messages)
            this.bus.set(message, new HandlerAndValidator());
    }

    public bindHandler(handler: MessageHandler, messageName: string, overwrite: boolean = true): this {
        if (this.bus.has(messageName) && !overwrite) {
            throw new MessageBusException(`Can not overwrite exists binding for ${messageName}.`);
        }

        var aux = this.bus.get(messageName);
        if (aux) {
            aux.messageHandler = handler;
            this.bus.set(messageName, aux);
        }
        else throw new MessageBusException(`The message ${messageName} is not present in the corresponding bus.`);
        return this;
    }

    public bindValidator(validator: MessageValidator, messageName: string, overwrite: boolean = true): this {
        if (this.bus.has(messageName) && !overwrite) {
            throw new MessageBusException(`Can not overwrite exists binding for ${messageName}.`);
        }

        var aux = this.bus.get(messageName);
        if (aux) {
            aux.messageValidator = validator;
            this.bus.set(messageName, aux);
        }
        else throw new MessageBusException(`The message ${messageName} is not present in the corresponding bus.`);
        return this;
    }

    private getObjectName(command): string {
        return Object.getPrototypeOf(command).constructor.name as string;
    }
}
