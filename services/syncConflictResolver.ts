export const SyncConflictResolver = {
    resolve<T extends { updatedAt?: number }>(local: T, remote: T): T {
        const localTime = local.updatedAt || 0
        const remoteTime = remote.updatedAt || 0

        // If timestamps are equal, prefer remote to ensure consistency across devices
        // or prefer local if we want to prioritize current device. 
        // Usually "server wins" or "last write wins". 
        // Let's go with strict Last Write Wins.
        if (localTime > remoteTime) {
            return local
        } else {
            return remote
        }
    },

    resolveList<T extends { id: string, updatedAt?: number }>(localList: T[], remoteList: T[]): T[] {
        const map = new Map<string, T>()

        // Add all local items
        localList.forEach(item => map.set(item.id, item))

        // Merge remote items
        remoteList.forEach(remoteItem => {
            const localItem = map.get(remoteItem.id)
            if (localItem) {
                map.set(remoteItem.id, this.resolve(localItem, remoteItem))
            } else {
                map.set(remoteItem.id, remoteItem)
            }
        })

        return Array.from(map.values())
    }
}
