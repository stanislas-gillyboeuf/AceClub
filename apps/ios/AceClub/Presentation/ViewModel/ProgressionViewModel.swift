import Foundation
import Combine

@MainActor
class ProgressionViewModel: ObservableObject {
    // Level
    @Published var userLevel: UserLevel = .empty
    @Published var isLoadingLevel: Bool = false

    // Streak
    @Published var userStreak: UserStreak = .empty
    @Published var isLoadingStreak: Bool = false

    // Challenges
    @Published var challenges: [Challenge] = []
    @Published var isLoadingChallenges: Bool = false

    // Badges
    @Published var badges: [Badge] = []
    @Published var allBadges: [Badge] = []
    @Published var isLoadingBadges: Bool = false

    // Titles
    @Published var titles: [Title] = []
    @Published var isLoadingTitles: Bool = false

    // Aces History
    @Published var acesHistory: [AcesTransaction] = []
    @Published var isLoadingHistory: Bool = false

    // Error
    @Published var errorMessage: String? = nil

    // Use Cases
    private let getMyLevelUseCase = GetMyLevelUseCase()
    private let getMyStreakUseCase = GetMyStreakUseCase()
    private let getMyChallengesUseCase = GetMyChallengesUseCase()
    private let getMyBadgesUseCase = GetMyBadgesUseCase()
    private let getAllBadgesUseCase = GetAllBadgesUseCase()
    private let getMyTitlesUseCase = GetMyTitlesUseCase()
    private let equipTitleUseCase = EquipTitleUseCase()
    private let getAcesHistoryUseCase = GetAcesHistoryUseCase()

    // MARK: - Load All

    func loadAll() async {
        async let levelTask: () = loadLevel()
        async let streakTask: () = loadStreak()
        async let challengesTask: () = loadChallenges()
        async let badgesTask: () = loadBadges()

        _ = await (levelTask, streakTask, challengesTask, badgesTask)
    }

    // MARK: - Level

    func loadLevel() async {
        isLoadingLevel = true
        defer { isLoadingLevel = false }

        do {
            let result = try await getMyLevelUseCase.execute()
            guard !Task.isCancelled else { return }
            userLevel = result
        } catch is CancellationError {
            // Ignore
        } catch {
            guard !Task.isCancelled else { return }
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Streak

    func loadStreak() async {
        isLoadingStreak = true
        defer { isLoadingStreak = false }

        do {
            let result = try await getMyStreakUseCase.execute()
            guard !Task.isCancelled else { return }
            userStreak = result
        } catch is CancellationError {
            // Ignore
        } catch {
            guard !Task.isCancelled else { return }
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Challenges

    func loadChallenges() async {
        isLoadingChallenges = true
        defer { isLoadingChallenges = false }

        do {
            let result = try await getMyChallengesUseCase.execute()
            guard !Task.isCancelled else { return }
            challenges = result
        } catch is CancellationError {
            // Ignore
        } catch {
            guard !Task.isCancelled else { return }
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Badges

    func loadBadges() async {
        isLoadingBadges = true
        defer { isLoadingBadges = false }

        do {
            async let myBadgesTask = getMyBadgesUseCase.execute()
            async let allBadgesTask = getAllBadgesUseCase.execute()

            let (myBadges, allBadgesResult) = try await (myBadgesTask, allBadgesTask)
            guard !Task.isCancelled else { return }
            badges = myBadges
            allBadges = allBadgesResult
        } catch is CancellationError {
            // Ignore
        } catch {
            guard !Task.isCancelled else { return }
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Titles

    func loadTitles() async {
        isLoadingTitles = true
        defer { isLoadingTitles = false }

        do {
            let result = try await getMyTitlesUseCase.execute()
            guard !Task.isCancelled else { return }
            titles = result
        } catch is CancellationError {
            // Ignore
        } catch {
            guard !Task.isCancelled else { return }
            errorMessage = error.localizedDescription
        }
    }

    func equipTitle(titleId: String) async {
        do {
            try await equipTitleUseCase.execute(titleId: titleId)
            await loadTitles()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Aces History

    func loadAcesHistory(page: Int = 1) async {
        isLoadingHistory = true
        defer { isLoadingHistory = false }

        do {
            let result = try await getAcesHistoryUseCase.execute(page: page)
            guard !Task.isCancelled else { return }
            if page == 1 {
                acesHistory = result
            } else {
                acesHistory.append(contentsOf: result)
            }
        } catch is CancellationError {
            // Ignore
        } catch {
            guard !Task.isCancelled else { return }
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Computed Properties

    var activeChallengesCount: Int {
        challenges.filter { $0.status == .active }.count
    }

    var unlockedBadgesCount: Int {
        badges.count
    }

    var totalBadgesCount: Int {
        allBadges.count
    }

    var equippedTitle: Title? {
        titles.first { $0.isEquipped }
    }
}
