package com.example.SmartInterviewSimulator.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.SmartInterviewSimulator.dto.HistoryDTO;
import com.example.SmartInterviewSimulator.entity.Answer;

public interface HistoryRepository extends JpaRepository<Answer, Long> {

    // ================= USER ROLE HISTORY =================
	@Query("""
			SELECT DISTINCT i.role
			FROM Interview i
			WHERE i.user.id = :userId
			""")
			List<String> getRolesByUser(Long userId);

    // ================= ROLE DETAILS =================
	@Query("""
			SELECT new com.example.SmartInterviewSimulator.dto.HistoryDTO(
			    q.questionText,
			    a.answerText,
			    a.feedback,
			    a.score
			)
			FROM Answer a
			JOIN a.question q
			WHERE LOWER(a.interview.role) = LOWER(:role)
			AND a.interview.user.id = :userId
			ORDER BY a.id ASC
			""")
			List<HistoryDTO> getHistory(
			    @Param("role") String role,
			    @Param("userId") Long userId
			);


@Query("""
SELECT DISTINCT i.role
FROM Interview i
WHERE i.user.email = :email
""")
List<String> getRolesByEmail(String email);

@Query("""
SELECT new com.example.SmartInterviewSimulator.dto.HistoryDTO(
 q.questionText,
 a.answerText,
 a.feedback,
 a.score
)
FROM Answer a
JOIN a.question q
WHERE a.interview.user.email = :email
AND LOWER(a.interview.role)=LOWER(:role)
ORDER BY a.id ASC
""")
List<HistoryDTO> getHistoryByEmail(
 @Param("role") String role,
 @Param("email") String email
);
}