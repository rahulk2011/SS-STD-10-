package com.edusmart.studytracker

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

/**
 * Smart Study Tracker - Pan-India B2B EdTech SaaS Architecture
 * Clean Architecture + MVVM + Jetpack Compose (Material 3) + Firebase Multi-Tenancy
 */

// ==========================================
// 1. DOMAIN LAYER: ENTITIES & VALUE OBJECTS
// ==========================================

enum class UserRole {
    STUDENT,
    PARENT,
    TEACHER,
    PRINCIPAL
}

enum class ChapterStudyStatus {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED,
    REVISION_NEEDED
}

data class SchoolTenant(
    val schoolId: String,
    val schoolName: String,
    val schoolCode: String,
    val city: String,
    val state: String,
    val boardAffiliation: String
)

data class AppUser(
    val uid: String,
    val email: String,
    val displayName: String,
    val role: UserRole,
    val schoolId: String,
    val classGrade: String? = null,
    val rollNumber: String? = null
)

data class ChapterNote(
    val id: String,
    val chapterNumber: Int,
    val code: String,
    val titleGu: String,
    val titleEn: String,
    val pagesRange: String,
    val category: String,
    val summaryGu: String,
    val summaryEn: String,
    val totalSectionsCount: Int
)

data class StudentProgress(
    val progressId: String,
    val studentId: String,
    val schoolId: String,
    val chapterId: String,
    val status: ChapterStudyStatus,
    val timeSpentMinutes: Int,
    val quizScore: Int?,
    val personalNotes: String,
    val lastUpdatedTimestamp: Long
)

// ==========================================
// 2. DATA LAYER: REPOSITORY & TENANT ISOLATION
// ==========================================

interface StudyNotesRepository {
    suspend fun getChaptersForSchool(schoolId: String): List<ChapterNote>
    suspend fun getStudentProgress(schoolId: String, studentId: String): List<StudentProgress>
    suspend fun saveProgress(progress: StudentProgress): Result<Unit>
}

class FakeFirestoreStudyRepository : StudyNotesRepository {
    private val inMemoryProgress = mutableMapOf<String, StudentProgress>()

    override suspend fun getChaptersForSchool(schoolId: String): List<ChapterNote> {
        // Multi-tenant check: schoolId is strictly enforced
        require(schoolId.isNotBlank()) { "schoolId cannot be blank for multi-tenant query" }
        return listOf(
            ChapterNote(
                id = "che-01-bharatno-varso",
                chapterNumber = 1,
                code = "che:01",
                titleGu = "ભારતનો વારસો",
                titleEn = "Heritage of India",
                pagesRange = "1 - 4",
                category = "Heritage & Culture",
                summaryGu = "વિષ્ણુપુરાણ, સંસ્કૃતિ, મેળાઓ, પ્રાચીન પ્રજાઓ અને કલમ 51(ક) મૂળભૂત ફરજો.",
                summaryEn = "Vishnu Purana, ancient tribes, fairs of Gujarat, Article 51(A).",
                totalSectionsCount = 4
            ),
            ChapterNote(
                id = "che-03-shilp-ane-sthapatya",
                chapterNumber = 3,
                code = "che:03",
                titleGu = "ભારતનો સાંસ્કૃતિક વારસો: શિલ્પ અને સ્થાપત્ય",
                titleEn = "Sculpture and Architecture",
                pagesRange = "11 - 23",
                category = "Sculpture & Architecture",
                summaryGu = "મોહેં-જો-દડો નગર આયોજન, ધોળાવીરા, લોથલ બંદર, સ્તૂપ અને વાવના 4 પ્રકારો.",
                summaryEn = "Harappan planning, Mohenjo-daro, Lothal dockyard, Stupas & Stepwells.",
                totalSectionsCount = 4
            )
        )
    }

    override suspend fun getStudentProgress(schoolId: String, studentId: String): List<StudentProgress> {
        require(schoolId.isNotBlank()) { "Security Exception: Missing tenant boundary schoolId" }
        return inMemoryProgress.values.filter { it.schoolId == schoolId && it.studentId == studentId }
    }

    override suspend fun saveProgress(progress: StudentProgress): Result<Unit> {
        require(progress.schoolId.isNotBlank()) { "Tenant violation: Empty schoolId" }
        inMemoryProgress[progress.progressId] = progress
        return Result.success(Unit)
    }
}

// ==========================================
// 3. DOMAIN USE CASES
// ==========================================

class GetSchoolSyllabusUseCase(private val repository: StudyNotesRepository) {
    suspend operator fun invoke(schoolId: String): Result<List<ChapterNote>> {
        return try {
            val list = repository.getChaptersForSchool(schoolId)
            Result.success(list)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class UpdateChapterProgressUseCase(private val repository: StudyNotesRepository) {
    suspend operator fun invoke(
        studentId: String,
        schoolId: String,
        chapterId: String,
        newStatus: ChapterStudyStatus,
        additionalMinutes: Int
    ): Result<Unit> {
        val progress = StudentProgress(
            progressId = "${studentId}_${chapterId}",
            studentId = studentId,
            schoolId = schoolId,
            chapterId = chapterId,
            status = newStatus,
            timeSpentMinutes = additionalMinutes,
            quizScore = null,
            personalNotes = "",
            lastUpdatedTimestamp = System.currentTimeMillis()
        )
        return repository.saveProgress(progress)
    }
}

// ==========================================
// 4. PRESENTATION: MVVM VIEWMODEL WITH UDF
// ==========================================

data class StudyTrackerUiState(
    val currentRole: UserRole = UserRole.STUDENT,
    val activeSchool: SchoolTenant = SchoolTenant(
        schoolId = "school_dps_gn",
        schoolName = "Delhi Public School, Gandhinagar",
        schoolCode = "DPS-GUJ-01",
        city = "Gandhinagar",
        state = "Gujarat",
        boardAffiliation = "GSEB / CBSE"
    ),
    val chapters: List<ChapterNote> = emptyList(),
    val completedCount: Int = 0,
    val totalStudyMinutes: Int = 0,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

sealed interface StudyTrackerUiIntent {
    data class SwitchRole(val role: UserRole) : StudyTrackerUiIntent
    data class SwitchSchool(val school: SchoolTenant) : StudyTrackerUiIntent
    data class MarkChapterStatus(val chapterId: String, val status: ChapterStudyStatus) : StudyTrackerUiIntent
    object RefreshData : StudyTrackerUiIntent
}

class StudyTrackerViewModel(
    private val getSyllabusUseCase: GetSchoolSyllabusUseCase,
    private val updateProgressUseCase: UpdateChapterProgressUseCase,
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
) {
    private val _uiState = MutableStateFlow(StudyTrackerUiState())
    val uiState: StateFlow<StudyTrackerUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    fun handleIntent(intent: StudyTrackerUiIntent) {
        when (intent) {
            is StudyTrackerUiIntent.SwitchRole -> {
                _uiState.update { it.copy(currentRole = intent.role) }
            }
            is StudyTrackerUiIntent.SwitchSchool -> {
                _uiState.update { it.copy(activeSchool = intent.school) }
                loadData()
            }
            is StudyTrackerUiIntent.MarkChapterStatus -> {
                updateChapterStatus(intent.chapterId, intent.status)
            }
            is StudyTrackerUiIntent.RefreshData -> {
                loadData()
            }
        }
    }

    private fun loadData() {
        val currentTenant = _uiState.value.activeSchool.schoolId
        _uiState.update { it.copy(isLoading = true, errorMessage = null) }
        coroutineScope.launch {
            val result = getSyllabusUseCase(currentTenant)
            result.onSuccess { notes ->
                _uiState.update {
                    it.copy(
                        chapters = notes,
                        completedCount = notes.size,
                        totalStudyMinutes = 180,
                        isLoading = false
                    )
                }
            }.onFailure { err ->
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = err.localizedMessage ?: "Failed to load chapters"
                    )
                }
            }
        }
    }

    private fun updateChapterStatus(chapterId: String, status: ChapterStudyStatus) {
        val tenant = _uiState.value.activeSchool.schoolId
        coroutineScope.launch {
            updateProgressUseCase(
                studentId = "student_aarav_10042",
                schoolId = tenant,
                chapterId = chapterId,
                newStatus = status,
                additionalMinutes = 15
            )
            loadData()
        }
    }
}
