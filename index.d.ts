import type { ParserOutput } from "lexure";
import type { NBT } from "prismarine-nbt";
import type { Client, PacketReader, PacketWriter, Position, ServerConnection } from "unborn-mcproto";

export type Event = {
    client: ServerConnection & ServerClient;
    cancelled: boolean;

    setCancelled(cancelled: boolean): void;
};

export type Packet = packets.Packet;

export enum ChatPosition {
    Chat,
    System,
    ActionBar
}

export type Rotation = {
    pitch: number;
    yaw: number;
    roll: number;
};

export type Slot = {
    blockId: -1;
} | {
    blockId: number,
    itemCount: number,
    itemDamage: number,
    nbt?: NBT;
};

export enum EntityMetadataType {
    Byte = 0,
    Short = 1,
    Int = 2,
    Float = 3,
    String = 4,
    Slot = 5,
    Position = 6,
    Rotation = 7
}

export type UUID = string;

export type EntityMetadata = Array<{
    type: EntityMetadataType.Int | EntityMetadataType.Float | EntityMetadataType.Short;
    value: number;
    key: number;
} | {
    type: EntityMetadataType.Byte;
    value: any;
    key: number;
} | {
    type: EntityMetadataType.String;
    value: string;
    key: number;
} | {
    type: EntityMetadataType.Slot;
    value: Slot;
    key: number;
} | {
    type: EntityMetadataType.Position;
    value: Position;
    key: number;
} | {
    type: EntityMetadataType.Rotation;
    value: Rotation;
    key: number;
}>;

export type ScoreboardTeam = {
    name: string;
    displayName?: string;
    prefix?: string;
    suffix?: string;
    friendlyFire?: number;
    nameTagVisibility?: "always" | "hideForOtherTeams" | "hideForOwnTeam" | "never";
    color?: number;
    players: string[];
};

export type HypixelLocation = {
    server: string;
    lobbyname?: string;
    gametype: string;
    mode?: string;
    map?: string;
};

export type Player = {
    uuid: string;
    name: string;
    properties: Array<{
        name: string;
        value: string;
        signature?: string;
    }>;
    gamemode: number;
    ping: number;
    displayName?: string;
};

export type ServerClient = {
    username: string;
    uuid: string;
    uuidShort: string;

    targetClient: Client;
    brand: string;

    scoreboardTeams: Map<string, ScoreboardTeam>;
    players: Player[];
    bots: string[];

    nicksToReal: Map<string, string>;
    usernameToUUID: any;

    partyMembers: string[];
    partyLeader: string;
    gameInfo: {
        started: boolean;
        currentPlayers: number;
        maxPlayers: number;
        timeLeft: number;
        successfullyCheckedPlayers: number;
        dodged: boolean;
        dodgeReason: string;
    };

    location: HypixelLocation | null;
    lastGame: HypixelLocation;
};

export type CommandHandler = {
    registerCommand(name: string, handlers: {
        execute?: (client: ServerConnection & ServerClient, raw: string, parsed: ParserOutput) => void | null;
        completion?: (client: ServerConnection & ServerClient, input: string) => string[];
    }): void;
    lexureParser: {
        parseInput(input: string): ParserOutput | null;
    };
};

export class PacketEvent<T> implements Event {
    client: ServerConnection & ServerClient;
    packet: T;
    cancelled: boolean;

    constructor(client: any, packet: T);
    setCancelled(cancelled: boolean): void;
}

export type Proxy = {
    addListener<T extends Event>(
        id: number,
        direction: "toClient" | "toServer",
        handler: (event: T) => Promise<void> | void,
        priority?: number,
        ignoreCancelled?: boolean): void;
    addAsyncListener<T extends Event>(
        id: number,
        direction: "toClient" | "toServer",
        handler: (event: T) => Promise<void>,
        priority?: number): void;
    writePacket<P extends Packet>(
        client: ServerConnection & ServerClient,
        id: ids.play.id,
        direction: "toClient" | "toServer",
        packet: P
    ): Promise<void>;
    chat(client: ServerConnection & ServerClient, input: string | string[] | object, position?: ChatPosition): void;
    chatJson(client: ServerConnection & ServerClient, json: any, position?: ChatPosition): void;
    registerPacketSerializer: <P extends Packet>(
        packetId: number,
        direction: "toServer" | "toClient" | "shared",
        serialize: (packet: P) => PacketWriter
    ) => void;
    registerPacketDeserializer: (
        packetId: number,
        direction: "toServer" | "toClient" | "shared",
        deserialize: (packet: PacketReader) => unknown
    ) => void;
};

export const proxy: Proxy;
export const commandHandler: CommandHandler;

export const versions: {
    sdk: string;
    lilith: string;
};

export namespace ids {
    export type id = handshaking.server | status.client | status.server | login.client | login.server | play.client | play.server;
    export namespace handshaking {
        export type id = server;
        export enum server {
            set_protocol = 0x00,
            legacy_server_list_ping = 0xfe
        }
    }
    export namespace status {
        export type id = client | server;
        export enum client {
            server_info = 0x00,
            ping
        }
        export enum server {
            ping_start = 0x00,
            ping
        }
    }
    export namespace login {
        export type id = client | server;
        export enum client {
            disconnect = 0x00,
            encryption_begin,
            success,
            compress
        }
        export enum server {
            login_start = 0x00,
            encryption_begin
        }
    }
    export namespace play {
        export type id = client | server;
        export enum client {
            keep_alive = 0x00,
            login,
            chat,
            update_time,
            entity_equipment,
            spawn_position,
            update_health,
            respawn,
            position,
            held_item_slot,
            bed,
            animation,
            named_entity_spawn,
            collect,
            spawn_entity,
            spawn_entity_living,
            spawn_entity_painting,
            spawn_entity_experience_orb,
            entity_velocity,
            entity_destroy,
            entity,
            rel_entity_move,
            entity_look,
            entity_move_look,
            entity_teleport,
            entity_head_rotation,
            entity_status,
            attach_entity,
            entity_metadata,
            entity_effect,
            remove_entity_effect,
            experience,
            update_attributes,
            map_chunk,
            multi_block_change,
            block_change,
            block_action,
            block_break_animation,
            map_chunk_bulk,
            explosion,
            world_event,
            named_sound_effect,
            world_particles,
            game_state_change,
            spawn_entity_weather,
            open_window,
            close_window,
            set_slot,
            window_items,
            craft_progress_bar,
            transaction,
            update_sign,
            map,
            tile_entity_data,
            open_sign_entity,
            statistics,
            player_info,
            abilities,
            tab_complete,
            scoreboard_objective,
            scoreboard_score,
            scoreboard_display_objective,
            scoreboard_team,
            custom_payload,
            kick_disconnect,
            difficulty,
            combat_event,
            camera,
            world_border,
            title,
            set_compression,
            playerlist_header,
            resource_pack_send,
            update_entity_nbt
        }
        export enum server {
            keep_alive = 0x00,
            chat,
            use_entity,
            flying,
            position,
            look,
            position_look,
            block_dig,
            block_place,
            held_item_slot,
            arm_animation,
            entity_action,
            steer_vehicle,
            close_window,
            window_click,
            transaction,
            set_creative_slot,
            enchant_item,
            update_sign,
            abilities,
            tab_complete,
            settings,
            client_command,
            custom_payload,
            spectate,
            resource_pack_receive
        }
    }
}

export namespace packets {
    export namespace play {
        export namespace client {
            export type KeepAlivePacket = {
                metadata: {
                    knownName?: "keep_alive";
                    name: string;
                    state: "play";
                };
                data: {
                    keepAliveId: number;
                };
            };
            export type LoginPacket = {
                metadata: {
                    knownName?: "login";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    gameMode: number;
                    dimension: number;
                    difficulty: number;
                    maxPlayers: number;
                    levelType: string;
                    reducedDebugInfo: boolean;
                };
            };
            export type ChatPacket = {
                metadata: {
                    knownName?: "chat";
                    name: string;
                    state: "play";
                };
                data: {
                    message: string;
                    position: number;
                };
            };
            export type UpdateTimePacket = {
                metadata: {
                    knownName?: "update_time";
                    name: string;
                    state: "play";
                };
                data: {
                    age: number;
                    time: number;
                };
            };
            export type EntityEquipmentPacket = {
                metadata: {
                    knownName?: "entity_equipment";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    slot: number;
                    item: Slot;
                };
            };
            export type SpawnPositionPacket = {
                metadata: {
                    knownName?: "spawn_position";
                    name: string;
                    state: "play";
                };
                data: {
                    location: Position;
                };
            };
            export type UpdateHealthPacket = {
                metadata: {
                    knownName?: "update_health";
                    name: string;
                    state: "play";
                };
                data: {
                    health: number;
                    food: number;
                    foodSaturation: number;
                };
            };
            export type RespawnPacket = {
                metadata: {
                    knownName?: "respawn";
                    name: string;
                    state: "play";
                };
                data: {
                    dimension: number;
                    difficulty: number;
                    gamemode: number;
                    levelType: string;
                };
            };
            export type PositionPacket = {
                metadata: {
                    knownName?: "position";
                    name: string;
                    state: "play";
                };
                data: {
                    x: number;
                    y: number;
                    z: number;
                    yaw: number;
                    pitch: number;
                    flags: number;
                };
            };
            export type HeldItemSlotPacket = {
                metadata: {
                    knownName?: "held_item_slot";
                    name: string;
                    state: "play";
                };
                data: {
                    slot: number;
                };
            };
            export type BedPacket = {
                metadata: {
                    knownName?: "bed";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    location: Position;
                };
            };
            export type AnimationPacket = {
                metadata: {
                    knownName?: "animation";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    animation: number;
                };
            };
            export type NamedEntitySpawnPacket = {
                metadata: {
                    knownName?: "named_entity_spawn";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    playerUUID: UUID;
                    x: number;
                    y: number;
                    z: number;
                    yaw: number;
                    pitch: number;
                    currentItem: number;
                    metadata: EntityMetadata;
                };
            };
            export type CollectPacket = {
                metadata: {
                    knownName?: "collect";
                    name: string;
                    state: "play";
                };
                data: {
                    collectedEntityId: number;
                    collectorEntityId: number;
                };
            };
            export type SpawnEntityPacket = {
                metadata: {
                    knownName?: "spawn_entity";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    x: number;
                    y: number;
                    z: number;
                    yaw: number;
                    pitch: number;
                    objectData: {
                        intField: number;
                        velocityX?: number;
                        velocityY?: number;
                        velocityZ?: number;
                    };
                };
            };
            export type SpawnEntityLivingPacket = {
                metadata: {
                    knownName?: "spawn_entity_living";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    x: number;
                    y: number;
                    z: number;
                    yaw: number;
                    pitch: number;
                    headPitch: number;
                    velocityX: number;
                    velocityY: number;
                    velocityZ: number;
                    metadata: EntityMetadata;
                };
            };
            export type SpawnEntityPaintingPacket = {
                metadata: {
                    knownName?: "spawn_entity_painting";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    title: string;
                    location: Position;
                    direction: number;
                };
            };
            export type SpawnEntityExperienceOrbPacket = {
                metadata: {
                    knownName?: "spawn_entity_experience_orb";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    x: number;
                    y: number;
                    z: number;
                    count: number;
                };
            };
            export type EntityVelocityPacket = {
                metadata: {
                    knownName?: "entity_velocity";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    velocityX: number;
                    velocityY: number;
                    velocityZ: number;
                };
            };
            export type EntityDestroyPacket = {
                metadata: {
                    knownName?: "entity_destroy";
                    name: string;
                    state: "play";
                };
                data: {
                    entityIds: Array<number>;
                };
            };
            export type EntityPacket = {
                metadata: {
                    knownName?: "entity";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                };
            };
            export type RelEntityMovePacket = {
                metadata: {
                    knownName?: "rel_entity_move";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    dX: number;
                    dY: number;
                    dZ: number;
                    onGround: boolean;
                };
            };
            export type EntityLookPacket = {
                metadata: {
                    knownName?: "entity_look";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    yaw: number;
                    pitch: number;
                    onGround: boolean;
                };
            };
            export type EntityMoveLookPacket = {
                metadata: {
                    knownName?: "entity_move_look";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    dX: number;
                    dY: number;
                    dZ: number;
                    yaw: number;
                    pitch: number;
                    onGround: boolean;
                };
            };
            export type EntityTeleportPacket = {
                metadata: {
                    knownName?: "entity_teleport";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    x: number;
                    y: number;
                    z: number;
                    yaw: number;
                    pitch: number;
                    onGround: boolean;
                };
            };
            export type EntityHeadRotationPacket = {
                metadata: {
                    knownName?: "entity_head_rotation";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    headYaw: number;
                };
            };
            export type EntityStatusPacket = {
                metadata: {
                    knownName?: "entity_status";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    entityStatus: number;
                };
            };
            export type AttachEntityPacket = {
                metadata: {
                    knownName?: "attach_entity";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    vehicleId: number;
                    leash: boolean;
                };
            };
            export type EntityMetadataPacket = {
                metadata: {
                    knownName?: "entity_metadata";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    metadata: EntityMetadata;
                };
            };
            export type EntityEffectPacket = {
                metadata: {
                    knownName?: "entity_effect";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    effectId: number;
                    amplifier: number;
                    duration: number;
                    hideParticles: boolean;
                };
            };
            export type RemoveEntityEffectPacket = {
                metadata: {
                    knownName?: "remove_entity_effect";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    effectId: number;
                };
            };
            export type ExperiencePacket = {
                metadata: {
                    knownName?: "experience";
                    name: string;
                    state: "play";
                };
                data: {
                    experienceBar: number;
                    level: number;
                    totalExperience: number;
                };
            };
            export type UpdateAttributesPacket = {
                metadata: {
                    knownName?: "update_attributes";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    properties: Array<{
                        countType: number;
                        content: {
                            key: string;
                            value: number;
                            modifiers: Array<{
                                UUID: string,
                                amount: number;
                                operation: number;
                            }>;
                        };
                    }>;
                };
            };
            export type MapChunkPacket = {
                metadata: {
                    knownName?: "map_chunk";
                    name: string;
                    state: "play";
                };
                data: {
                    x: number;
                    z: number;
                    groundUp: boolean;
                    bitMap: number;
                    chunkData: Buffer;
                };
            };
            export type MultiBlockChangePacket = {
                metadata: {
                    knownName?: "multi_block_change";
                    name: string;
                    state: "play";
                };
                data: {
                    chunkX: number;
                    chunkZ: number;
                    records: Array<{
                        horizontalPos: number;
                        y: number;
                        blockId: number;
                    }>;
                };
            };
            export type BlockChangePacket = {
                metadata: {
                    knownName?: "block_change";
                    name: string;
                    state: "play";
                };
                data: {
                    location: Position;
                    type: number;
                };
            };
            export type BlockActionPacket = {
                metadata: {
                    knownName?: "block_action";
                    name: string;
                    state: "play";
                };
                data: {
                    location: Position;
                    byte1: number;
                    byte2: number;
                    blockId: number;
                };
            };
            export type BlockBreakAnimationPacket = {
                metadata: {
                    knownName?: "block_break_animation";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    location: Position;
                    destroyStage: number;
                };
            };
            export type MapChunkBulkPacket = {
                metadata: {
                    knownName?: "map_chunk_bulk";
                    name: string;
                    state: "play";
                };
                data: {
                    skyLightSend: boolean;
                    meta: Array<{
                        x: number;
                        z: number;
                        bitMap: number;
                    }>;
                    data: Buffer;
                };
            };
            export type ExplosionPacket = {
                metadata: {
                    knownName?: "explosion";
                    name: string;
                    state: "play";
                };
                data: {
                    x: number;
                    y: number;
                    z: number;
                    radius: number;
                    affectedBlockOffsets: Array<Position>;
                    playerMotionX: number;
                    playerMotionY: number;
                    playerMotionZ: number;
                };
            };
            export type WorldEventPacket = {
                metadata: {
                    knownName?: "world_event";
                    name: string;
                    state: "play";
                };
                data: {
                    effectId: number;
                    location: Position;
                    data: number;
                    global: boolean;
                };
            };
            export type NamedSoundEffectPacket = {
                metadata: {
                    knownName?: "named_sound_effect";
                    name: string;
                    state: "play";
                };
                data: {
                    soundName: string;
                    x: number;
                    y: number;
                    z: number;
                    volume: number;
                    pitch: number;
                };
            };
            export type WorldParticlesPacket = {
                metadata: {
                    knownName?: "world_particles";
                    name: string;
                    state: "play";
                };
                data: {
                    particleId: number;
                    longDistance: boolean;
                    x: number;
                    y: number;
                    z: number;
                    offsetX: number;
                    offsetY: number;
                    offsetZ: number;
                    particleData: number;
                    particles: number;
                    data: Array<number>;
                };
            };
            export type GameStateChangePacket = {
                metadata: {
                    knownName?: "game_state_change";
                    name: string;
                    state: "play";
                };
                data: {
                    reason: number;
                    gameMode: number;
                };
            };
            export type SpawnEntityWeatherPacket = {
                metadata: {
                    knownName?: "spawn_entity_weather";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    type: number;
                    x: number;
                    y: number;
                    z: number;
                };
            };
            export type OpenWindowPacket = {
                metadata: {
                    knownName?: "open_window";
                    name: string;
                    state: "play";
                };
                data: {
                    windowId: number;
                    inventoryType: string;
                    windowTitle: number;
                    slotCount: number;
                    entityId: any; // TODO: Figure out
                };
            };
            export type CloseWindowPacket = {
                metadata: {
                    knownName?: "close_window";
                    name: string;
                    state: "play";
                };
                data: {
                    windowId: number;
                };
            };
            export type SetSlotPacket = {
                metadata: {
                    knownName?: "set_slot";
                    name: string;
                    state: "play";
                };
                data: {
                    windowId: number;
                    slot: number;
                    item: Slot;
                };
            };
            export type WindowItemsPacket = {
                metadata: {
                    knownName?: "window_items";
                    name: string;
                    state: "play";
                };
                data: {
                    windowId: number;
                    items: Array<Slot>;
                };
            };
            export type CraftProgressBarPacket = {
                metadata: {
                    knownName?: "craft_progress_bar";
                    name: string;
                    state: "play";
                };
                data: {
                    windowId: number;
                    property: number;
                    value: boolean;
                };
            };
            export type TransactionPacket = {
                metadata: {
                    knownName?: "transaction";
                    name: string;
                    state: "play";
                };
                data: {
                    windowId: number;
                    action: number;
                    accepted: boolean;
                };
            };
            export type UpdateSignPacket = {
                metadata: {
                    knownName?: "update_sign";
                    name: string;
                    state: "play";
                };
                data: {
                    location: Position;
                    text1: string;
                    text2: string;
                    text3: string;
                    text4: string;
                };
            };
            export type MapPacket = {
                metadata: {
                    knownName?: "map";
                    name: string;
                    state: "play";
                };
                data: {
                    itemDamage: number;
                    scale: number;
                    icons: Array<{
                        countType: number;
                        content: {
                            directionAndType: number;
                            x: number;
                            y: number;
                        };
                    }>;
                    columns: number;
                    rows?: number;
                    x?: number;
                    y?: number;
                    data?: Buffer;
                };
            };
            export type TileEntityDataPacket = {
                metadata: {
                    knownName?: "tile_entity_data";
                    name: string;
                    state: "play";
                };
                data: {
                    location: Position;
                    action: number;
                    nbtData?: NBT;
                };
            };
            export type OpenSignEntityPacket = {
                metadata: {
                    knownName?: "open_sign_entity";
                    name: string;
                    state: "play";
                };
                data: {
                    location: Position;
                };
            };
            export type StatisticsPacket = {
                metadata: {
                    knownName?: "statistics";
                    name: string;
                    state: "play";
                };
                data: {
                    entries: Array<{
                        name: string;
                        value: number;
                    }>;
                };
            };
            export type PlayerInfoPacket = {
                metadata: {
                    knownName?: "player_info";
                    name: string;
                    state: "play";
                };
                data: {
                    action: PlayerInfoAction.AddPlayer;
                    data: Array<{
                        UUID: UUID;
                        name: string;
                        properties: Array<{
                            name: string;
                            value: string;
                            signature?: string;
                        }>;
                        gamemode: number;
                        ping: number;
                        displayName?: string;
                    }>;
                } | {
                    action: PlayerInfoAction.UpdateGamemode;
                    data: Array<{
                        UUID: UUID;
                        gamemode: number;
                    }>;
                } | {
                    action: PlayerInfoAction.UpdatePing;
                    data: Array<{
                        UUID: UUID;
                        ping: number;
                    }>;
                } | {
                    action: PlayerInfoAction.UpdateDisplayName;
                    data: Array<{
                        UUID: UUID;
                        displayName?: string;
                    }>;
                } | {
                    action: PlayerInfoAction.RemovePlayer;
                    data: Array<{
                        UUID: UUID;
                    }>;
                };
            };
            export type AbilitiesPacket = {
                metadata: {
                    knownName?: "abilities";
                    name: string;
                    state: "play";
                };
                data: {
                    flags: number;
                    flyingSpeed: number;
                    walkingSpeed: number;
                };
            };
            export type TabCompletePacket = {
                metadata: {
                    knownName?: "tab_complete";
                    name: string;
                    state: "play";
                };
                data: {
                    matches: Array<string>;
                };
            };

            export type ScoreboardObjectivePacket = {
                metadata: {
                    knownName?: "scoreboard_objective";
                    name: string;
                    state: "play";
                };
                data: {
                    name: string;
                    action: ScoreboardObjectiveAction.Create | ScoreboardObjectiveAction.Update;
                    displayText: string;
                    type: string;
                } | {
                    name: string;
                    action: ScoreboardObjectiveAction.Remove;
                };
            };
            export type ScoreboardScorePacket = {
                metadata: {
                    knownName?: "scoreboard_score";
                    name: string;
                    state: "play";
                };
                data: {
                    itemName: string;
                    action: number;
                    scoreName: string;
                    value?: number;
                };
            };
            export type ScoreboardDisplayObjectivePacket = {
                metadata: {
                    knownName?: "scoreboard_display_objective";
                    name: string;
                    state: "play";
                };
                data: {
                    position: number;
                    name: string;
                };
            };
            export type ScoreboardTeamPacket = {
                metadata: {
                    knownName?: "scoreboard_team";
                    name: string;
                    state: "play";
                };
                data: {
                    team: string;
                    mode: ScoreboardTeamMode.Create;
                    name: string;
                    prefix: string;
                    suffix: string;
                    friendlyFire: number;
                    nameTagVisibility: "always" | "hideForOtherTeams" | "hideForOwnTeam" | "never";
                    color: number;
                    players: Array<string>;
                } | {
                    team: string;
                    mode: ScoreboardTeamMode.Remove;
                } | {
                    team: string;
                    mode: ScoreboardTeamMode.UpdateInformation;
                    name: string;
                    prefix: string;
                    suffix: string;
                    friendlyFire: number;
                    nameTagVisibility: "always" | "hideForOtherTeams" | "hideForOwnTeam" | "never";
                    color: number;
                } | {
                    team: string;
                    mode: ScoreboardTeamMode.AddPlayers | ScoreboardTeamMode.RemovePlayers;
                    players: Array<string>;
                };
            };
            export type CustomPayloadPacket = {
                metadata: {
                    knownName?: "custom_payload";
                    name: string;
                    state: "play";
                };
                data: {
                    channel: string;
                    data: Buffer;
                };
            };
            export type KickDisconnectPacket = {
                metadata: {
                    knownName?: "kick_disconnect";
                    name: string;
                    state: "play";
                };
                data: {
                    reason: string;
                };
            };
            export type DifficultyPacket = {
                metadata: {
                    knownName?: "difficulty";
                    name: string;
                    state: "play";
                };
                data: {
                    difficulty: Difficulty;
                };
            };
            export type CombatEventPacket = {
                metadata: {
                    knownName?: "combat_event";
                    name: string;
                    state: "play";
                };
                data: {
                    event: CombatEvent.Enter;
                } | {
                    event: CombatEvent.End;
                    duration: number;
                    entityId: number;
                } | {
                    event: CombatEvent.Dead;
                    playerId: number;
                    entityId: number;
                    message: string;
                };
            };
            export type CameraPacket = {
                metadata: {
                    knownName?: "camera";
                    name: string;
                    state: "play";
                };
                data: {
                    cameraId: number;
                };
            };
            export type WorldBorderPacket = {
                metadata: {
                    knownName?: "world_border";
                    name: string;
                    state: "play";
                };
                data: {
                    action: WorldBorderAction.SetSize;
                    radius: number;
                } | {
                    action: WorldBorderAction.LerpSize;
                    old_radius: number;
                    new_radius: number;
                    speed: number;
                } | {
                    action: WorldBorderAction.SetCenter;
                    x: number;
                    z: number;
                } | {
                    action: WorldBorderAction.Initialize;
                    x: number;
                    z: number;
                    old_radius: number;
                    new_radius: number;
                    speed: number;
                    portalBoundary: number;
                    warning_time: number;
                    warning_blocks: number;
                } | {
                    action: WorldBorderAction.SetWarningTime;
                    warning_time: number;
                } | {
                    action: WorldBorderAction.SetWarningBlocks;
                    warning_blocks: number;
                };
            };
            export type TitlePacket = {
                metadata: {
                    knownName?: "title";
                    name: string;
                    state: "play";
                };
                data: {
                    action: TitleAction.SetTitle | TitleAction.SetSubtitle;
                    text: string;
                } | {
                    action: TitleAction.SetTimesAndDisplay;
                    fadeIn: number;
                    stay: number;
                    fadeOut: number;
                } | {
                    action: TitleAction.Hide | TitleAction.Reset;
                };
            };
            /**
             * @deprecated Use login.client.CompressPacket instead
             */
            export type SetCompressionPacket = {
                metadata: {
                    knownName?: "set_compression";
                    name: string;
                    state: "play";
                };
                data: {
                    time: number;
                };
            };
            export type PlayerlistHeaderPacket = {
                metadata: {
                    knownName?: "playerlist_header";
                    name: string;
                    state: "play";
                };
                data: {
                    header: string;
                    footer: string;
                };
            };
            export type ResourcePackSendPacket = {
                metadata: {
                    knownName?: "resource_pack_send";
                    name: string;
                    state: "play";
                };
                data: {
                    url: string;
                    hash: string;
                };
            };
            export type UpdateEntityNBTPacket = {
                metadata: {
                    knownName?: "update_entity_nbt";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    tag: NBT;
                };
            };
        }
        export namespace server {
            export type KeepAlivePacket = {
                metadata: {
                    knownName?: "keep_alive";
                    name: string;
                    state: "play";
                };
                data: {
                    keepAliveId: number;
                };
            };
            export type ChatPacket = {
                metadata: {
                    knownName?: "chat";
                    name: string;
                    state: "play";
                };
                data: {
                    message: string;
                };
            };
            export type UseEntityPacket = {
                metadata: {
                    knownName?: "use_entity";
                    name: string;
                    state: "play";
                };
                data: {
                    target: number;
                    mouse: number;
                    x?: number;
                    y?: number;
                    z?: number; // TODO: do more nicely
                };
            };
            export type FlyingPacket = {
                metadata: {
                    knownName?: "flying";
                    name: string;
                    state: "play";
                };
                data: {
                    onGround: boolean;
                };
            };
            export type PositionPacket = {
                metadata: {
                    knownName?: "position";
                    name: string;
                    state: "play";
                };
                data: {
                    x: number;
                    y: number;
                    z: number;
                    onGround: boolean;
                };
            };
            export type LookPacket = {
                metadata: {
                    knownName?: "look";
                    name: string;
                    state: "play";
                };
                data: {
                    yaw: number;
                    pitch: number;
                    onGround: boolean;
                };
            };
            export type PositionLookPacket = {
                metadata: {
                    knownName?: "position_look";
                    name: string;
                    state: "play";
                };
                data: {
                    x: number;
                    y: number;
                    z: number;
                    yaw: number;
                    pitch: number;
                    onGround: boolean;
                };
            };
            export type BlockDigPacket = {
                metadata: {
                    knownName?: "block_dig";
                    name: string;
                    state: "play";
                };
                data: {
                    status: number;
                    location: Position;
                    face: number;
                };
            };
            export type BlockPlacePacket = {
                metadata: {
                    knownName?: "block_place";
                    name: string;
                    state: "play";
                };
                data: {
                    location: Position;
                    direction: number;
                    heldItem: Slot;
                    cursorX: number;
                    cursorY: number;
                    cursorZ: number;
                };
            };
            export type HeldItemSlotPacket = {
                metadata: {
                    knownName?: "held_item_slot";
                    name: string;
                    state: "play";
                };
                data: {
                    slotId: number;
                };
            };
            export type ArmAnimationPacket = {
                metadata: {
                    knownName?: "arm_animation";
                    name: string;
                    state: "play";
                };
                data: {};
            };
            export type EntityActionPacket = {
                metadata: {
                    knownName?: "entity_action";
                    name: string;
                    state: "play";
                };
                data: {
                    entityId: number;
                    actionId: number;
                    jumpBoost: number;
                };
            };
            export type SteerVehiclePacket = {
                metadata: {
                    knownName?: "steer_vehicle";
                    name: string;
                    state: "play";
                };
                data: {
                    sideways: number;
                    forward: number;
                    jump: number;
                };
            };
            export type CloseWindowPacket = {
                metadata: {
                    knownName?: "close_window";
                    name: string;
                    state: "play";
                };
                data: {
                    windowId: number;
                };
            };
            export type WindowClickPacket = {
                metadata: {
                    knownName?: "window_click";
                    name: string;
                    state: "play";
                };
                data: {
                    windowId: number;
                    slot: number;
                    mouseButton: number;
                    action: number;
                    mode: number;
                    item: Slot;
                };
            };
            export type TransactionPacket = {
                metadata: {
                    knownName?: "transaction";
                    name: string;
                    state: "play";
                };
                data: {
                    windowId: number;
                    action: number;
                    accepted: boolean;
                };
            };
            export type SetCreativeSlotPacket = {
                metadata: {
                    knownName?: "set_creative_slot";
                    name: string;
                    state: "play";
                };
                data: {
                    slot: number;
                    item: Slot;
                };
            };
            export type EnchantItemPacket = {
                metadata: {
                    knownName?: "enchant_item";
                    name: string;
                    state: "play";
                };
                data: {
                    windowId: number;
                    enchantment: number;
                };
            };
            export type UpdateSignPacket = {
                metadata: {
                    knownName?: "update_sign";
                    name: string;
                    state: "play";
                };
                data: {
                    location: Position;
                    text1: string;
                    text2: string;
                    text3: string;
                    text4: string;
                };
            };
            export type AbilitiesPacket = {
                metadata: {
                    knownName?: "abilities";
                    name: string;
                    state: "play";
                };
                data: {
                    flags: number;
                    flyingSpeed: number;
                    walkingSpeed: number;
                };
            };
            export type TabCompletePacket = {
                metadata: {
                    knownName?: "tab_complete";
                    name: string;
                    state: "play";
                };
                data: {
                    text: string;
                    block?: Position;
                };
            };
            export type SettingsPacket = {
                metadata: {
                    knownName?: "settings";
                    name: string;
                    state: "play";
                };
                data: {
                    locale: string;
                    viewDistance: number;
                    chatFlags: number;
                    chatColors: boolean;
                    skinParts: number;
                };
            };
            export type ClientCommandPacket = {
                metadata: {
                    knownName?: "client_command";
                    name: string;
                    state: "play";
                };
                data: {
                    payload: number;
                };
            };
            export type CustomPayloadPacket = {
                metadata: {
                    knownName?: "custom_payload";
                    name: string;
                    state: "play";
                };
                data: {
                    channel: string;
                    data: Buffer;
                };
            };
            export type SpectatePacket = {
                metadata: {
                    knownName?: "spectate_packet";
                    name: string;
                    state: "play";
                };
                data: {
                    target: UUID;
                };
            };
            export type ResourcePackReceivePacket = {
                metadata: {
                    knownName?: "resource_pack_receive";
                    name: string;
                    state: "play";
                };
                data: {
                    hash: string;
                    result: number;
                };
            };
        }
    }

    export namespace status {
        export namespace client {
            export type ServerInfoPacket = {
                metadata: {
                    knownName?: "server_info";
                    name: string;
                    state: "status";
                };
                data: {
                    response: string;
                };
            };
            export type PingPacket = {
                metadata: {
                    knownName?: "ping";
                    name: string;
                    state: "status";
                };
                data: {
                    time: number;
                };
            };
        }
        export namespace server {
            export type PingStartPacket = {
                metadata: {
                    knownName?: "ping_start";
                    name: string;
                    state: "status";
                };
                data: {};
            };
            export type PingPacket = {
                metadata: {
                    knownName?: "ping";
                    name: string;
                    state: "status";
                };
                data: {
                    time: number;
                };
            };
        }
    }

    export namespace handshaking {
        export namespace server {
            export type LegacyServerListPingPacket = {
                metadata: {
                    knownName?: "legacy_server_list_ping";
                    name: string;
                    state: "handshaking";
                };
                data: {
                    payload: any;
                };
            };
            export type SetProtocolPacket = {
                metadata: {
                    knownName?: "set_protocol";
                    name: string;
                    state: "handshaking";
                };
                data: {
                    protocolVersion: number,
                    serverHost: string,
                    serverPort: number;
                    nextState: number;
                };
            };
        }
    }

    export namespace login {
        export namespace client {
            export type DisconnectPacket = {
                metadata: {
                    knownName?: "disconnect";
                    name: string;
                    state: "login";
                };
                data: {
                    reason: string;
                };
            };
            export type EncryptionBeginPacket = {
                metadata: {
                    knownName?: "encryption_begin";
                    name: string;
                    state: "login";
                };
                data: {
                    serverId: string;
                    publicKey: Buffer;
                    verifyToken: Buffer;
                };
            };
            export type SuccessPacket = {
                metadata: {
                    knownName?: "success";
                    name: string;
                    state: "login";
                };
                data: {
                    uuid: UUID;
                    username: string;
                };
            };
            export type CompressPacket = {
                metadata: {
                    knownName?: "compress";
                    name: string;
                    state: "login";
                };
                data: {
                    threshold: number;
                };
            };
        }
        export namespace server {
            export type loginStartPacket = {
                metadata: {
                    knownName?: "login_start";
                    name: string;
                    state: "login";
                };
                data: {
                    username: string;
                };
            };
            export type EncryptionBeginPacket = {
                metadata: {
                    knownName?: "encryption_begin";
                    name: string;
                    state: "login";
                };
                data: {
                    sharedSecret: Buffer;
                    verifyToken: Buffer;
                };
            };
        }
    }

    export type PlayerInfoData = {
        UUID: UUID;
        name: string;
        properties: Array<{
            name: string;
            value: string;
            signature?: string;
        }>;
        gamemode: number;
        ping: number;
        displayName?: string;
    } | {
        UUID: UUID;
        gamemode: number;
    } | {
        UUID: UUID;
        ping: number;
    } | {
        UUID: UUID,
        displayName?: string;
    } | {
        UUID: UUID;
    };

    export enum PlayerInfoAction {
        AddPlayer = 0,
        UpdateGamemode = 1,
        UpdatePing = 2,
        UpdateDisplayName = 3,
        RemovePlayer = 4
    }

    export enum ScoreboardObjectiveAction {
        Create = 0,
        Remove = 1,
        Update = 2
    }

    export enum ScoreboardTeamMode {
        Create = 0,
        Remove = 1,
        UpdateInformation = 2,
        AddPlayers = 3,
        RemovePlayers = 4
    }

    export enum Difficulty {
        Peaceful = 0,
        Easy = 1,
        Normal = 2,
        Hard = 3
    }

    export enum CombatEvent {
        Enter = 0,
        End = 1,
        Dead = 2
    }

    export enum WorldBorderAction {
        SetSize = 0,
        LerpSize = 1,
        SetCenter = 2,
        Initialize = 3,
        SetWarningTime = 4,
        SetWarningBlocks = 5
    }

    export enum TitleAction {
        SetTitle = 0,
        SetSubtitle = 1,
        SetTimesAndDisplay = 2,
        Hide = 3,
        Reset = 4
    }

    export function isPacket(packet: any): packet is Packet;

    export type Packet =
        play.client.KeepAlivePacket |
        play.client.LoginPacket |
        play.client.ChatPacket |
        play.client.UpdateTimePacket |
        play.client.EntityEquipmentPacket |
        play.client.SpawnPositionPacket |
        play.client.UpdateHealthPacket |
        play.client.RespawnPacket |
        play.client.PositionPacket |
        play.client.HeldItemSlotPacket |
        play.client.BedPacket |
        play.client.AnimationPacket |
        play.client.NamedEntitySpawnPacket |
        play.client.CollectPacket |
        play.client.SpawnEntityPacket |
        play.client.SpawnEntityLivingPacket |
        play.client.SpawnEntityPaintingPacket |
        play.client.SpawnEntityExperienceOrbPacket |
        play.client.EntityVelocityPacket |
        play.client.EntityDestroyPacket |
        play.client.EntityPacket |
        play.client.RelEntityMovePacket |
        play.client.EntityLookPacket |
        play.client.EntityMoveLookPacket |
        play.client.EntityTeleportPacket |
        play.client.EntityHeadRotationPacket |
        play.client.EntityStatusPacket |
        play.client.AttachEntityPacket |
        play.client.EntityMetadataPacket |
        play.client.EntityEffectPacket |
        play.client.RemoveEntityEffectPacket |
        play.client.ExperiencePacket |
        play.client.UpdateAttributesPacket |
        play.client.MapChunkPacket |
        play.client.MultiBlockChangePacket |
        play.client.BlockChangePacket |
        play.client.BlockActionPacket |
        play.client.BlockBreakAnimationPacket |
        play.client.MapChunkBulkPacket |
        play.client.ExplosionPacket |
        play.client.WorldEventPacket |
        play.client.NamedSoundEffectPacket |
        play.client.WorldParticlesPacket |
        play.client.GameStateChangePacket |
        play.client.SpawnEntityWeatherPacket |
        play.client.OpenWindowPacket |
        play.client.CloseWindowPacket |
        play.client.SetSlotPacket |
        play.client.WindowItemsPacket |
        play.client.CraftProgressBarPacket |
        play.client.TransactionPacket |
        play.client.UpdateSignPacket |
        play.client.MapPacket |
        play.client.TileEntityDataPacket |
        play.client.OpenSignEntityPacket |
        play.client.StatisticsPacket |
        play.client.PlayerInfoPacket |
        play.client.AbilitiesPacket |
        play.client.TabCompletePacket |
        play.client.ScoreboardObjectivePacket |
        play.client.ScoreboardScorePacket |
        play.client.ScoreboardDisplayObjectivePacket |
        play.client.ScoreboardTeamPacket |
        play.client.CustomPayloadPacket |
        play.client.KickDisconnectPacket |
        play.client.DifficultyPacket |
        play.client.CombatEventPacket |
        play.client.CameraPacket |
        play.client.WorldBorderPacket |
        play.client.TitlePacket |
        play.client.SetCompressionPacket |
        play.client.PlayerlistHeaderPacket |
        play.client.ResourcePackSendPacket |
        play.client.UpdateEntityNBTPacket |
        play.server.KeepAlivePacket |
        play.server.ChatPacket |
        play.server.UseEntityPacket |
        play.server.FlyingPacket |
        play.server.PositionPacket |
        play.server.LookPacket |
        play.server.PositionLookPacket |
        play.server.BlockDigPacket |
        play.server.BlockPlacePacket |
        play.server.HeldItemSlotPacket |
        play.server.ArmAnimationPacket |
        play.server.EntityActionPacket |
        play.server.SteerVehiclePacket |
        play.server.CloseWindowPacket |
        play.server.WindowClickPacket |
        play.server.TransactionPacket |
        play.server.SetCreativeSlotPacket |
        play.server.EnchantItemPacket |
        play.server.UpdateSignPacket |
        play.server.AbilitiesPacket |
        play.server.TabCompletePacket |
        play.server.SettingsPacket |
        play.server.ClientCommandPacket |
        play.server.CustomPayloadPacket |
        play.server.SpectatePacket |
        play.server.ResourcePackReceivePacket |
        handshaking.server.SetProtocolPacket |
        handshaking.server.LegacyServerListPingPacket |
        status.client.ServerInfoPacket |
        status.client.PingPacket |
        status.server.PingStartPacket |
        status.server.PingPacket |
        login.client.DisconnectPacket |
        login.client.EncryptionBeginPacket |
        login.client.SuccessPacket |
        login.client.CompressPacket |
        login.server.loginStartPacket |
        login.server.EncryptionBeginPacket;
}