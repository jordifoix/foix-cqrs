import { GeoJsonObject } from "geojson";

export abstract class MessageBus {
    abstract execute(message): Promise<any>;

    abstract bindHandler(handler, /*message: Message*/messageName: string, overwrite?: boolean): this;

    abstract bindValidator(validator, messageName: string, overwrite?: boolean): this;
}

export abstract class Message {
    public auth: string;
    public payload: Map<string,JSON>;
    public constructor(auth: string, payload: Map<string,any>) {
        this.auth = auth;
        this.payload = payload;
    }
    public getAuth() { return this.auth; }
    public getPayload() { return this.payload; }
    protected abstract isValid(): boolean;
}

export class MessageHandler {
    public constructor() {
    }
    /* Aquest handle() no s'hauria d'executar mai; quan Bus.execute() el crida sobre la instància del handler 
    * corresponent a un command, query o event concret hauria de ser sobrescrit per aquest handle i executar-se la seva versió i no aquesta.
    * (Funciona com una classe abstracta sense ser-ho, ja que si ho fós no podríem inicialitzar MessageHandler a Bus.ts) */
    public handle(message: Message) { return new Promise<any>( () => {} ); }
}

export class MessageValidator {
    public constructor() {
    }
    /* Aquest isValid() no s'hauria d'executar mai; quan Bus.execute() el crida sobre la instància del validator 
    * corresponent a un command o query concret hauria de ser sobrescrit per aquest validator i executar-se la seva versió i no aquesta.
    * (Funciona com una classe abstracta sense ser-ho, ja que si ho fós no podríem inicialitzar MessageValidator a Bus.ts) */
    public isValid(message: Message) { return true; }
}

/**
 * Helpers for TS projects
 */
export abstract class Command extends Message {
    public constructor(auth: string, payload: Map<string,Map<string,any>) {
        super(auth,payload);
        // other things to be done with commands here
    }
    public abstract isValid(): boolean;
}

export abstract class Query extends Message {
    public abstract isValid(): boolean;
}

export class Event extends Message {
    public isValid() { return true; } //els events no s'han de validar, són generats pel sistema
}

export abstract class CommandHandler extends MessageHandler {
    abstract handle(command: Command): Promise<any>;
}

export abstract class QueryHandler extends MessageHandler {
    abstract handle(query: Query): Promise<any>;
}

export abstract class EventHandler extends MessageHandler {
    abstract handle(event: Event): Promise<any>
}

export abstract class CommandValidator extends MessageValidator {
    abstract isValid(command: Command): boolean;
}

export abstract class QueryValidator extends MessageValidator {
    abstract isValid(query: Query): boolean;
}

export class EventValidator extends MessageValidator {
    //els events sempre són vàlids perquè els genera el propi sistema
    isValid(event: Event) { return true; }
}
