import Foundation

enum SessionMapper {
    static func map(sessionDTO: SessionInfoDTO) -> Session {
        return Session(
            id: sessionDTO.id,
            expiresAt: sessionDTO.expiresAt,
            userId: sessionDTO.userId
        )
    }
}
