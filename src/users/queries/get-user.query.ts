export class GetUserQuery {
    constructor(public readonly id: string) { }
}

export class GetUsersQuery {
    constructor(
        public readonly page: number = 1,
        public readonly limit: number = 10,
    ) { }
} 