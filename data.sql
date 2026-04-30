SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict hCr5A2ufG51B07hP4LPcBT1BPtJuN8BIKCD5lyxM3qZ3VZ8xgk2ilbEcqtUWXlH

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret", "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping", "authorization_params", "enabled", "email_optional", "issuer", "discovery_url", "skip_nonce_check", "cached_discovery", "discovery_cached_at", "authorization_url", "token_url", "userinfo_url", "jwks_uri", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_clients" ("id", "client_secret_hash", "registration_type", "redirect_uris", "grant_types", "client_name", "client_uri", "logo_uri", "created_at", "updated_at", "deleted_at", "client_type", "token_endpoint_auth_method") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid", "last_webauthn_challenge_data") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_authorizations" ("id", "authorization_id", "client_id", "user_id", "redirect_uri", "scope", "state", "resource", "code_challenge", "code_challenge_method", "response_type", "status", "authorization_code", "created_at", "expires_at", "approved_at", "nonce") FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_client_states" ("id", "provider_type", "code_verifier", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_consents" ("id", "user_id", "client_id", "scopes", "granted_at", "revoked_at") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at", "disabled") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_challenges" ("id", "user_id", "challenge_type", "session_data", "created_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_credentials" ("id", "user_id", "credential_id", "public_key", "attestation_type", "aaguid", "sign_count", "transports", "backup_eligible", "backed_up", "friendly_name", "created_at", "updated_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."Cart" ("id", "userId", "createdAt", "itemId", "itemType") FROM stdin;
1a1ae56d-5a54-49f7-97e4-0f79aae98721	0b2553ef-638c-47af-ae1d-ccb7501e6ce3	2025-09-26 00:09:11.53	wistia_gitlab_interview_001	VIDEO
e4885c76-968d-425f-9ec6-964a35be120c	0b2553ef-638c-47af-ae1d-ccb7501e6ce3	2025-09-26 00:09:08.824	49f25e81-52ec-4d2e-9e64-a8a5533d4fe0	WORKSHOP
efbfc57a-3ef8-49f5-95ff-9db78458d72b	0b2553ef-638c-47af-ae1d-ccb7501e6ce3	2025-09-26 00:09:27.45	Celpip_template.pdf	DOCUMENT
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."Course" ("id", "title", "description", "price", "createdAt", "updatedAt", "category", "targetAudienceTypes", "isPublic", "processContent", "processTitle", "showOnMain", "thumbnailUrl", "time", "videoLink", "visualTitle", "visualTitle2", "recommendedLinks") FROM stdin;
59694697-fe29-4cdb-9627-628d94302814	북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지	북미에서 개발자로 취업하려면 코딩 실력만큼이나 채용공고를 제대로 읽고 이해하는 능력이 중요해요. 특히 요즘은 AI 덕분에 개발 생산성이 높아지면서, 지난 5년간 북미 지역의 개발자 채용공고 수가 약 35%나 줄었어요. 그만큼 기업들은 더 신중하게, 해당 포지션을 정말 잘 이해하고 있는 지원자를 찾고 있죠.\n\n한국과는 조금 다른 북미식 채용공고의 특징, 어떻게 읽고 준비해야 할지 막막하셨다면, 실제 캐나다 기업에 최종 합격한 페이스메이커 개발자의 영문 이력서를 통해 채용공고 분석부터 이력서에 반영하는 방법까지 함께 살펴보세요!	2800	2026-01-16 04:25:36.74	2026-01-16 04:25:36.74	INTERVIEW	{IT,GOVERNMENT}	f	\N	\N	f	\N	\N	\N	\N	\N	\N
87f6741e-4ef1-481d-bc9b-3d9fe73607cb	북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지	북미에서 개발자로 취업하려면 코딩 실력만큼이나 채용공고를 제대로 읽고 이해하는 능력이 중요해요. 특히 요즘은 AI 덕분에 개발 생산성이 높아지면서, 지난 5년간 북미 지역의 개발자 채용공고 수가 약 35%나 줄었어요. 그만큼 기업들은 더 신중하게, 해당 포지션을 정말 잘 이해하고 있는 지원자를 찾고 있죠.\n\n한국과는 조금 다른 북미식 채용공고의 특징, 어떻게 읽고 준비해야 할지 막막하셨다면, 실제 캐나다 기업에 최종 합격한 페이스메이커 개발자의 영문 이력서를 통해 채용공고 분석부터 이력서에 반영하는 방법까지 함께 살펴보세요!	2800	2026-01-16 04:25:39.607	2026-01-16 04:25:39.607	RESUME	{IT,GOVERNMENT}	f	\N	\N	f	\N	\N	\N	\N	\N	\N
51c1a6e8-5641-46fd-ae62-10d1a43c0c22	북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지	북미에서 개발자로 취업하려면 코딩 실력만큼이나 채용공고를 제대로 읽고 이해하는 능력이 중요해요. 특히 요즘은 AI 덕분에 개발 생산성이 높아지면서, 지난 5년간 북미 지역의 개발자 채용공고 수가 약 35%나 줄었어요. 그만큼 기업들은 더 신중하게, 해당 포지션을 정말 잘 이해하고 있는 지원자를 찾고 있죠.\n\n한국과는 조금 다른 북미식 채용공고의 특징, 어떻게 읽고 준비해야 할지 막막하셨다면, 실제 캐나다 기업에 최종 합격한 페이스메이커 개발자의 영문 이력서를 통해 채용공고 분석부터 이력서에 반영하는 방법까지 함께 살펴보세요!	2800	2026-01-16 04:25:42.315	2026-01-16 04:25:42.315	NETWORKING	{IT,GOVERNMENT}	f	\N	\N	f	\N	\N	\N	\N	\N	\N
1042ae1e-aa2b-470e-a2f1-1da830e244f8	북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지	북미에서 개발자로 취업하려면 코딩 실력만큼이나 채용공고를 제대로 읽고 이해하는 능력이 중요해요. 특히 요즘은 AI 덕분에 개발 생산성이 높아지면서, 지난 5년간 북미 지역의 개발자 채용공고 수가 약 35%나 줄었어요. 그만큼 기업들은 더 신중하게, 해당 포지션을 정말 잘 이해하고 있는 지원자를 찾고 있죠.\n\n한국과는 조금 다른 북미식 채용공고의 특징, 어떻게 읽고 준비해야 할지 막막하셨다면, 실제 캐나다 기업에 최종 합격한 페이스메이커 개발자의 영문 이력서를 통해 채용공고 분석부터 이력서에 반영하는 방법까지 함께 살펴보세요!	2800	2026-01-16 04:25:45.08	2026-01-16 04:25:45.08	INTERVIEW	{IT,GOVERNMENT}	f	\N	\N	f	\N	\N	\N	\N	\N	\N
551cdb89-263c-4c23-85a7-8b53bb1d2c82	북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지	북미에서 개발자로 취업하려면 코딩 실력만큼이나 채용공고를 제대로 읽고 이해하는 능력이 중요해요. 특히 요즘은 AI 덕분에 개발 생산성이 높아지면서, 지난 5년간 북미 지역의 개발자 채용공고 수가 약 35%나 줄었어요. 그만큼 기업들은 더 신중하게, 해당 포지션을 정말 잘 이해하고 있는 지원자를 찾고 있죠.\n\n한국과는 조금 다른 북미식 채용공고의 특징, 어떻게 읽고 준비해야 할지 막막하셨다면, 실제 캐나다 기업에 최종 합격한 페이스메이커 개발자의 영문 이력서를 통해 채용공고 분석부터 이력서에 반영하는 방법까지 함께 살펴보세요!	2800	2026-01-16 04:25:47.841	2026-01-16 04:25:47.841	RESUME	{IT,GOVERNMENT}	f	\N	\N	f	\N	\N	\N	\N	\N	\N
2392d3ea-e47c-4854-bb16-c8a39ff114dc	북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지	북미에서 개발자로 취업하려면 코딩 실력만큼이나 채용공고를 제대로 읽고 이해하는 능력이 중요해요. 특히 요즘은 AI 덕분에 개발 생산성이 높아지면서, 지난 5년간 북미 지역의 개발자 채용공고 수가 약 35%나 줄었어요. 그만큼 기업들은 더 신중하게, 해당 포지션을 정말 잘 이해하고 있는 지원자를 찾고 있죠.\n\n한국과는 조금 다른 북미식 채용공고의 특징, 어떻게 읽고 준비해야 할지 막막하셨다면, 실제 캐나다 기업에 최종 합격한 페이스메이커 개발자의 영문 이력서를 통해 채용공고 분석부터 이력서에 반영하는 방법까지 함께 살펴보세요!	2800	2026-01-16 04:25:50.723	2026-01-16 04:25:50.723	NETWORKING	{IT,GOVERNMENT}	f	\N	\N	f	\N	\N	\N	\N	\N	\N
41821778-d487-4442-83f5-cb4fb0173df1	test	test	100	2026-04-23 17:29:22.623	2026-04-23 17:29:22.623	INTERVIEW	{IT,FINANCE}	t			f	e331eef6-f157-4d2b-8cfc-f85f2988f70f.jpeg	03:00	https://vimeo.com/123456789	test	test	[{"url": "/courses/2392d3ea-e47c-4854-bb16-c8a39ff114dc", "name": "test", "errors": {}}]
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."Document" ("id", "documentId", "title", "description", "uploadDate", "price", "bucketUrl", "category", "isMain", "isPublic", "subDescription", "subTitle", "tableOfContents", "thumbnail", "visualTitle1", "visualTitle2", "recommendedLinks", "targetAudienceTypes") FROM stdin;
6888d856-a85b-4548-8de7-808e1c6180ae	ebook-1	The 94% Success Formula: A Proven Approach to Job & Career Transitions	Learn what truly matters in hiring criteria and how to build the right experience to strengthen your resume.	2026-03-26 11:17:30.408	2800	seeded://ebook-1	MARKETING	t	t	\N	Branding & Networking for Marketers	[{"id": "1", "title": "Developer Job Posting Examples", "content": "Review real North American job posting examples to understand current hiring trends."}, {"id": "2", "title": "Analyzing Developer Job Postings", "content": "Analyze resume strategies and key keywords based on actual North American job postings."}, {"id": "3", "title": "Resume Examples from Hired Developers", "content": "Learn how to analyze and leverage job postings through successful real-world resumes."}]	/img/ebook_image1.png	Branding & Networking	for Marketers	\N	{NETWORKING}
44d900c1-6f80-47e5-96a3-c30f149c7fd5	ebook-2	What Every Designer Should Know: Interviews That Shape Your Career	Identify your unique strengths and communicate your design thinking with confidence during interviews.	2026-03-26 11:17:30.409	2800	seeded://ebook-2	DESIGN	t	t	\N	Preparing for Design Interviews	[{"id": "1", "title": "Developer Job Posting Examples", "content": "Review real North American job posting examples to understand current hiring trends."}, {"id": "2", "title": "Analyzing Developer Job Postings", "content": "Analyze resume strategies and key keywords based on actual North American job postings."}, {"id": "3", "title": "Resume Examples from Hired Developers", "content": "Learn how to analyze and leverage job postings through successful real-world resumes."}]	/img/ebook_image2.png	Preparing for	Design Interviews	\N	{DESIGN}
50cc86fb-6e2b-4464-95b2-be19210b3f7f	ebook-3	A Resume That Gets You Hired in the North American Public Sector	Learn how to structure your resume to meet public sector hiring criteria and leave a strong, positive impression on recruiters.	2026-03-26 11:17:30.41	2800	seeded://ebook-3	PUBLIC	t	t	\N	Public Sector Resume	[{"id": "1", "title": "Developer Job Posting Examples", "content": "Review real North American job posting examples to understand current hiring trends."}, {"id": "2", "title": "Analyzing Developer Job Postings", "content": "Analyze resume strategies and key keywords based on actual North American job postings."}, {"id": "3", "title": "Resume Examples from Hired Developers", "content": "Learn how to analyze and leverage job postings through successful real-world resumes."}]	/img/ebook_image3.png	Public Sector	Resume	\N	{GOVERNMENT}
cb719f97-4cdc-4c1d-8c78-0b26880608e6	ebook-4	The 94% Success Formula: Resumes That Win Jobs and Interviews	Understand what hiring managers look for and learn how to build a resume and interview strategy aligned with North American IT hiring standards.	2026-03-26 11:17:30.411	2800	seeded://ebook-4	IT	f	t	\N	IT Resume & Interview Preparation	[{"id": "1", "title": "Developer Job Posting Examples", "content": "Review real North American job posting examples to understand current hiring trends."}, {"id": "2", "title": "Analyzing Developer Job Postings", "content": "Analyze resume strategies and key keywords based on actual North American job postings."}, {"id": "3", "title": "Resume Examples from Hired Developers", "content": "Learn how to analyze and leverage job postings through successful real-world resumes."}]	/img/ebook_image4.png	IT Resume &	Interview Preparation	\N	{IT}
9dab48c9-b93d-4160-9710-beca95c1cd41	ebook-5	A practical guide to Interviews for finance and accounting roles, learn once, use for life.	Learn how to identify your strengths and clues to present them in resumes and interviews.	2026-03-26 11:17:30.412	2800	seeded://ebook-5	ACCOUNTING	f	t	\N	Preparing for Accounting Interviews	[{"id": "1", "title": "Developer Job Posting Examples", "content": "Review real North American job posting examples to understand current hiring trends."}, {"id": "2", "title": "Analyzing Developer Job Postings", "content": "Analyze resume strategies and key keywords based on actual North American job postings."}, {"id": "3", "title": "Resume Examples from Hired Developers", "content": "Learn how to analyze and leverage job postings through successful real-world resumes."}]	/img/ebook_image5.png	Preparing for	Accounting Interviews	\N	{FINANCE}
d4b7139c-391b-4302-9e0b-a8615f5f31d1	ebook-6	The 94% success approach: communicate your value clearly in job searches and career moves.	Learn what truly matters in resumes and how to build relevant experience strategically.	2026-03-26 11:17:30.413	2800	seeded://ebook-6	SERVICE	f	t	\N	Resume & Networking for Service Roles	[{"id": "1", "title": "Developer Job Posting Examples", "content": "Review real North American job posting examples to understand current hiring trends."}, {"id": "2", "title": "Analyzing Developer Job Postings", "content": "Analyze resume strategies and key keywords based on actual North American job postings."}, {"id": "3", "title": "Resume Examples from Hired Developers", "content": "Learn how to analyze and leverage job postings through successful real-world resumes."}]	/img/ebook_image6.png	Resume & Networking	for Service Roles	\N	{SERVICE}
\.


--
-- Data for Name: Favorite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."Favorite" ("id", "userId", "createdAt", "itemId", "itemType") FROM stdin;
\.


--
-- Data for Name: Image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."Image" ("id", "fileName", "url", "createdAt") FROM stdin;
a14ee6ba-9c9f-42a1-8a88-6113bbfd9b52	7bdbad87-f0a1-4a82-9ff2-3983fe820d13.jpeg	https://apnbtkynvquutxdmmkre.supabase.co/storage/v1/object/public/image/7bdbad87-f0a1-4a82-9ff2-3983fe820d13.jpeg	2025-08-07 22:36:00.823
e67b401a-190c-461d-ac23-b67b8dd4f717	5c963cda-212f-4649-8c92-9dbf45e31c6f.jpeg	https://apnbtkynvquutxdmmkre.supabase.co/storage/v1/object/public/image/5c963cda-212f-4649-8c92-9dbf45e31c6f.jpeg	2025-08-07 22:32:53.253
99cb6547-fb88-4e33-b950-e4794dc64d66	76e2a42e-c679-4be6-84ae-8bf6cc7aef4d.jpeg	https://apnbtkynvquutxdmmkre.supabase.co/storage/v1/object/public/undefined/76e2a42e-c679-4be6-84ae-8bf6cc7aef4d.jpeg	2026-04-17 00:38:56.516
e1bb10f9-20ef-4172-8871-dc463ff748de	70283f2e-1ea6-4a53-a355-74c52dd1c389.jpeg	https://apnbtkynvquutxdmmkre.supabase.co/storage/v1/object/public/undefined/70283f2e-1ea6-4a53-a355-74c52dd1c389.jpeg	2026-04-17 00:40:43.217
c60f30c8-46e7-4617-802f-9819733f8675	413dc161-333a-4f6f-a6d3-78161bd7f8a0.jpeg	https://apnbtkynvquutxdmmkre.supabase.co/storage/v1/object/public/undefined/413dc161-333a-4f6f-a6d3-78161bd7f8a0.jpeg	2026-04-17 01:02:19.266
d91e3499-456c-4c30-bb2d-eafa0596782c	549bc055-87bd-4a9e-aa44-d81505dcc11c.jpeg	https://apnbtkynvquutxdmmkre.supabase.co/storage/v1/object/public/undefined/549bc055-87bd-4a9e-aa44-d81505dcc11c.jpeg	2026-04-17 01:02:56.613
5236d888-d7a8-43c3-8e80-c5c26c556581	e331eef6-f157-4d2b-8cfc-f85f2988f70f.jpeg	https://apnbtkynvquutxdmmkre.supabase.co/storage/v1/object/public/image/e331eef6-f157-4d2b-8cfc-f85f2988f70f.jpeg	2026-04-23 17:25:58.521
dfdc1d5f-5fc4-4628-8eca-9a6427efec26	c75da032-f163-4454-8667-eb75279ac2fb.jpeg	https://apnbtkynvquutxdmmkre.supabase.co/storage/v1/object/public/image/c75da032-f163-4454-8667-eb75279ac2fb.jpeg	2026-04-23 17:26:22.309
\.


--
-- Data for Name: Instructor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."Instructor" ("id", "name", "profileImage", "description", "careers") FROM stdin;
1d524faa-d43b-4a36-8759-1a3396e26fae	Raphael. Lee	/img/instructor-image.png	I've been managing multicultural teams for over 19 years. And blessed to lead and be part of the opening teams in global projects in various countries. Growing personal & professional goals by sharing visions with teammates became a part of my passion and a long-term goal in my life.	[{"id": "a70a7216-45fa-4d40-98a7-3c266d266f82", "period": "2019 ~", "position": "Managing Director at Pacemaker", "orderIndex": 1}, {"id": "5005f916-c926-4e6f-a4f5-043e27194f0b", "period": "2015 ~ 2019", "position": "Director of Operations at Metanet", "orderIndex": 2}, {"id": "1d524faa-d43b-4a36-8759-1a3396e26fae", "period": "2009 ~ 2014", "position": "Business Development Manager at People In Biz Corp.", "orderIndex": 3}, {"id": "050f8f6a-e499-4da2-a70d-579d8f96041e", "period": "2004 ~ 2008", "position": "Purchaser at InterContinental Hotels Group", "orderIndex": 4}]
050f8f6a-e499-4da2-a70d-579d8f96041e	김개발	/img/instructor-image.png	5년간 React 개발 경험을 바탕으로 실무 중심의 강의를 제공합니다. 현대적인 웹 개발 트렌드를 반영한 실용적인 강의를 지향합니다.	[{"id": "1aa6a3e6-4a80-426a-8b1d-a144b019d291", "period": "2022 ~", "position": "Senior Frontend Developer at TechCorp", "orderIndex": 1}, {"id": "ae0dc183-7abd-4642-bf58-28f3066b65bf", "period": "2019 ~ 2022", "position": "Frontend Developer at StartupCo", "orderIndex": 2}]
62bed443-98bb-46b6-b9fd-dca37044d662	Mock Instructor	/img/instructor-image.png	시드 데이터용 Mock 강사입니다.	[{"period": "2020 ~", "position": "Senior Instructor at PaceUP"}, {"period": "2016 ~ 2020", "position": "Frontend Engineer at TechCorp"}]
8a602710-cb1f-4230-a5a7-1925b642d27a	Raphael. Lee	/img/instructor-image.png	I’ve bee managing multicultural teams for ever 19 years. And blesses to lead and be part of the opening teams in global projects in various countries. Growing personal & professional goals by sharing visions with teammates became a part of my passion and a long-term goal in my life.	[{"period": "2019 ~", "position": "Managing Director at Pacemaker"}, {"period": "2015 ~ 2019", "position": "Director of Operations at Metanet"}, {"period": "2009 ~ 2014", "position": "Business Development Manager at People In Biz Corp."}, {"period": "2004 ~ 2008", "position": "Purchaser at InterContinental Hotels Group"}]
2aa80bf7-16ef-4341-9c80-485137281144	Raphael. Lee	/img/instructor-image.png	I’ve bee managing multicultural teams for ever 19 years. And blesses to lead and be part of the opening teams in global projects in various countries. Growing personal & professional goals by sharing visions with teammates became a part of my passion and a long-term goal in my life.	[{"period": "2019 ~", "position": "Managing Director at Pacemaker"}, {"period": "2015 ~ 2019", "position": "Director of Operations at Metanet"}, {"period": "2009 ~ 2014", "position": "Business Development Manager at People In Biz Corp."}, {"period": "2004 ~ 2008", "position": "Purchaser at InterContinental Hotels Group"}]
5c3418f2-639e-40fd-8cc3-aa2acb8e4392	test	https://apnbtkynvquutxdmmkre.supabase.co/storage/v1/object/public/undefined/70283f2e-1ea6-4a53-a355-74c52dd1c389.jpeg	test	[{"endDate": "", "isCurrent": true, "startDate": "2018", "description": "test"}]
529238e8-db71-495c-8075-d539cfdea338	test2	https://apnbtkynvquutxdmmkre.supabase.co/storage/v1/object/public/undefined/549bc055-87bd-4a9e-aa44-d81505dcc11c.jpeg	test2	[{"endDate": "", "isCurrent": true, "startDate": "2023", "description": "test2"}]
23dc6ef5-7395-4bdf-b580-3d1d102f44b8	test	c75da032-f163-4454-8667-eb75279ac2fb.jpeg	test	[{"endDate": "", "isCurrent": true, "startDate": "2018", "description": "test"}]
\.


--
-- Data for Name: MainVisual; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."MainVisual" ("id", "title", "description", "isPublic", "startDate", "endDate", "startTime", "endTime", "thumbnail", "link", "linkName", "orderIndex", "createdAt", "updatedAt") FROM stdin;
705aeab1-e86e-43d9-829a-0f6035d59c0c	Build the skills to launch your career abroad.\nExperience, resumes, and interviews, all in one place.	Begin your career journey in the U.S. & Canada with Pacemaker.\nFrom resumes to interview skills and networking, every step is supported.	t	\N	\N	\N	\N	\N	/courses	Explore programs	0	2026-03-27 18:45:11.529	2026-03-27 18:45:11.529
b3fbdd6c-5aaa-4ce4-ac27-69cbc1065721	Your future career starts here.	\N	t	\N	\N	\N	\N	\N	/courses	Get Started	2	2026-03-27 18:45:11.529	2026-03-27 18:45:11.529
2c563754-0edb-4e80-9153-a02e85b23769	Ready to take the next step?	\N	t	\N	\N	\N	\N	\N	\N	\N	1	2026-03-27 18:45:11.529	2026-03-27 18:45:11.529
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."Order" ("id", "userId", "totalAmount", "status", "stripePaymentIntentId", "stripeInvoiceId", "stripeInvoiceUrl", "orderedAt", "updatedAt") FROM stdin;
5e4a2ea4-c1e6-4044-a397-8463a060e5c2	76961d93-0f30-4089-a3e8-310ecf027d03	563	COMPLETED	\N	\N	\N	2025-10-01 10:02:50.857	2026-01-16 03:33:03.628
bd302e9d-903d-457e-9f61-aed4679f0a57	76961d93-0f30-4089-a3e8-310ecf027d03	458	COMPLETED	\N	\N	\N	2025-09-26 02:31:03.232	2026-01-16 03:33:03.912
1ae6cdd0-fcd6-4cca-bc02-900134a5f3c5	76961d93-0f30-4089-a3e8-310ecf027d03	436	COMPLETED	\N	\N	\N	2026-01-14 21:59:35.188	2026-01-16 03:33:04.189
996b03dc-df34-486e-b31e-d47611182291	e6295ea8-f0d1-4eaf-bc8f-4c0f1ab0bee2	305	COMPLETED	\N	\N	\N	2026-01-14 00:46:12.036	2026-01-16 03:33:04.761
e05b256f-f3c3-48b8-a53e-b356d0c7c310	e6295ea8-f0d1-4eaf-bc8f-4c0f1ab0bee2	181	COMPLETED	\N	\N	\N	2025-10-17 18:47:45.218	2026-01-16 03:33:05.031
9644e3a5-dd83-4078-b24c-4fc6766a5040	df973246-b40f-4357-8de1-d98df77264fe	74	COMPLETED	\N	\N	\N	2025-10-16 03:31:01.257	2026-01-16 03:33:05.876
4927645c-2cc9-4c49-90b1-7567f11b59b8	df973246-b40f-4357-8de1-d98df77264fe	578	COMPLETED	\N	\N	\N	2025-11-05 16:01:48.519	2026-01-16 03:33:06.145
c9f4bfed-4c2a-431c-9c8c-9a4f146e5fb6	e980f584-be8c-4144-a0cf-944fac60a4f8	293	COMPLETED	\N	\N	\N	2025-10-25 12:57:47.349	2026-01-16 03:33:06.7
1675c190-f649-4488-b247-6ca7b94b3729	e980f584-be8c-4144-a0cf-944fac60a4f8	248	COMPLETED	\N	\N	\N	2026-01-03 22:50:02.093	2026-01-16 03:33:06.988
faca132e-fc4a-458c-9e35-1982820bc872	4c19d334-8d3e-4b45-b57e-8b247a451af2	189	COMPLETED	\N	\N	\N	2025-11-03 18:30:26.727	2026-01-16 03:33:07.545
b5557098-31a2-476c-a67a-cf32d5c111c1	4c19d334-8d3e-4b45-b57e-8b247a451af2	477	COMPLETED	\N	\N	\N	2025-09-30 22:29:14.333	2026-01-16 03:33:07.844
e7a72246-4783-4bb5-84c2-21b386e3e43f	4c19d334-8d3e-4b45-b57e-8b247a451af2	244	COMPLETED	\N	\N	\N	2025-10-25 15:37:25.341	2026-01-16 03:33:08.162
0e94b9aa-5f1f-4bb4-b4f4-e121b782ce77	4c19d334-8d3e-4b45-b57e-8b247a451af2	387	COMPLETED	\N	\N	\N	2025-10-16 18:08:43.789	2026-01-16 03:33:08.484
565d8ca7-8887-4831-b4b4-05d6011ea95f	934c7f39-2b18-4115-9106-94e2ca01aa0a	248	COMPLETED	\N	\N	\N	2025-09-27 05:24:52.508	2026-01-16 03:33:09.04
28f0a44a-07e5-42be-a861-d8657892144e	934c7f39-2b18-4115-9106-94e2ca01aa0a	165	COMPLETED	\N	\N	\N	2026-01-10 18:37:09.382	2026-01-16 03:33:09.325
87d94929-7cef-4ee9-ab31-0950581c3090	934c7f39-2b18-4115-9106-94e2ca01aa0a	190	COMPLETED	\N	\N	\N	2026-01-09 02:14:35.371	2026-01-16 03:33:09.599
e14810ef-b894-4707-82cf-fbe7c2f5b1be	934c7f39-2b18-4115-9106-94e2ca01aa0a	372	COMPLETED	\N	\N	\N	2025-10-02 03:51:11.102	2026-01-16 03:33:09.871
a47679d8-e69e-4831-b26f-050024aa8f5a	7dee36c2-96d7-407e-810c-dc72630b4a82	334	COMPLETED	\N	\N	\N	2026-01-06 14:16:58.767	2026-01-16 03:33:10.436
096fafa7-03e4-4334-8274-b53d20d75572	4206e45f-1a69-4bbd-874d-25774af9282b	454	COMPLETED	\N	\N	\N	2026-01-11 15:00:05.155	2026-01-16 03:33:11.267
5f28bd4f-71fe-4e2a-83f6-f22df3aa9627	4206e45f-1a69-4bbd-874d-25774af9282b	394	COMPLETED	\N	\N	\N	2025-12-13 17:26:53.199	2026-01-16 03:33:11.549
75bd9b0a-77ca-449c-b3b5-dff7b89ab1d6	4206e45f-1a69-4bbd-874d-25774af9282b	225	COMPLETED	\N	\N	\N	2025-11-02 11:57:56.395	2026-01-16 03:33:11.821
5b842488-fdeb-47b7-9385-b65000ac5fc4	4206e45f-1a69-4bbd-874d-25774af9282b	68	COMPLETED	\N	\N	\N	2025-12-12 03:06:12.736	2026-01-16 03:33:12.112
d4f6f605-d44e-4a34-b4c7-df2c94f799bd	30b53927-60fd-44e4-a14d-c7b5a56c06cc	73	COMPLETED	\N	\N	\N	2025-10-31 18:51:09.748	2026-01-16 03:33:12.663
f1c3ecd4-eb6c-49f0-9a20-258b5077a996	30b53927-60fd-44e4-a14d-c7b5a56c06cc	311	COMPLETED	\N	\N	\N	2025-10-07 02:21:25.092	2026-01-16 03:33:12.926
6c4e850a-1fa4-4dd4-943c-9590821ba7b4	30b53927-60fd-44e4-a14d-c7b5a56c06cc	373	COMPLETED	\N	\N	\N	2026-01-10 10:51:26.541	2026-01-16 03:33:13.205
3013cd32-1fe2-4334-8a55-c283570049be	30b53927-60fd-44e4-a14d-c7b5a56c06cc	435	COMPLETED	\N	\N	\N	2025-11-20 09:06:03.564	2026-01-16 03:33:13.469
f8d8957d-cd21-405c-bf57-17b44d94f0f2	1a33220e-b2a6-4bdc-b7fa-b3c01adb259c	450	COMPLETED	\N	\N	\N	2025-11-03 21:34:15.215	2026-01-16 03:33:14.018
e86aa013-5961-4ba2-abf0-14df4ac318f7	1a33220e-b2a6-4bdc-b7fa-b3c01adb259c	394	COMPLETED	\N	\N	\N	2025-10-04 03:07:17.451	2026-01-16 03:33:14.321
61b0ab7f-bef5-4770-86b3-256de5afbeee	41600165-6b41-4d64-ac92-a9c2d223f40d	71	COMPLETED	\N	\N	\N	2025-10-11 18:05:57.834	2026-01-16 03:33:14.911
4921b62b-acec-46fa-84ed-d0960ed697cc	41600165-6b41-4d64-ac92-a9c2d223f40d	82	COMPLETED	\N	\N	\N	2025-11-27 18:15:59.659	2026-01-16 03:33:15.195
c78c935a-19db-4686-a159-7786bea49f2b	41600165-6b41-4d64-ac92-a9c2d223f40d	225	COMPLETED	\N	\N	\N	2025-10-23 01:00:52.573	2026-01-16 03:33:15.457
5972bc75-7935-4f47-8757-a0b6f466c867	41600165-6b41-4d64-ac92-a9c2d223f40d	161	COMPLETED	\N	\N	\N	2025-10-13 05:47:28.551	2026-01-16 03:33:15.761
c9150297-afd5-4e7c-9a4e-b25fe831aeb6	41600165-6b41-4d64-ac92-a9c2d223f40d	560	COMPLETED	\N	\N	\N	2026-01-06 01:23:00.618	2026-01-16 03:33:16.039
900a61e1-9d12-4f86-8f7b-f5821e9c136f	dcbb7f9a-0bdd-4851-8432-4e6e4a8ebf10	470	COMPLETED	\N	\N	\N	2025-10-14 19:09:12.564	2026-01-16 03:33:16.593
53d94a52-98ff-49cc-9fad-bc2db7eed103	dcbb7f9a-0bdd-4851-8432-4e6e4a8ebf10	629	COMPLETED	\N	\N	\N	2025-10-18 02:43:33.789	2026-01-16 03:33:16.87
fff004d0-75ca-4e9b-a68f-ce30b2de77a7	dcbb7f9a-0bdd-4851-8432-4e6e4a8ebf10	215	COMPLETED	\N	\N	\N	2025-11-06 00:19:03.624	2026-01-16 03:33:17.144
08488006-6d7c-4b8e-bac9-468883f0d11b	dcbb7f9a-0bdd-4851-8432-4e6e4a8ebf10	260	COMPLETED	\N	\N	\N	2025-11-12 19:09:28.622	2026-01-16 03:33:17.441
c6936eb0-3a93-4937-ad95-d50c45e92a28	dcbb7f9a-0bdd-4851-8432-4e6e4a8ebf10	662	COMPLETED	\N	\N	\N	2025-09-28 12:35:45.342	2026-01-16 03:33:17.762
29290649-e414-4d8d-9452-2021b9d2aaba	7ab89e45-7d56-47ee-8afd-e1c438f811f1	235	COMPLETED	\N	\N	\N	2025-10-12 13:34:27.025	2026-01-16 03:33:18.486
3b6e93d5-a211-4b95-9b06-02f8cb51982a	7ab89e45-7d56-47ee-8afd-e1c438f811f1	331	COMPLETED	\N	\N	\N	2025-10-12 12:27:09.095	2026-01-16 03:33:18.961
2d48443b-3ad6-4105-9890-33b3ff0161cb	7ab89e45-7d56-47ee-8afd-e1c438f811f1	167	COMPLETED	\N	\N	\N	2025-09-22 20:44:42.049	2026-01-16 03:33:19.322
78e2ca55-5d62-44c9-ad5b-8b4db12e5012	f859502f-c6bc-4a51-82f1-8cf5459e1e83	354	COMPLETED	\N	\N	\N	2025-12-25 08:11:37.556	2026-01-16 03:33:19.953
c1a706ab-ac31-4e45-babe-82db5fb6aae8	a879858c-2c8e-4d79-999c-4a90b97ad000	164	COMPLETED	\N	\N	\N	2025-12-07 03:23:31.979	2026-01-16 03:33:20.556
d126c456-394a-4488-847c-ee37fad260d7	a879858c-2c8e-4d79-999c-4a90b97ad000	372	COMPLETED	\N	\N	\N	2025-10-11 20:18:09.978	2026-01-16 03:33:20.828
0acbaaac-e535-4cee-a9c3-64a2657ca006	a879858c-2c8e-4d79-999c-4a90b97ad000	163	COMPLETED	\N	\N	\N	2026-01-14 16:32:15.887	2026-01-16 03:33:21.101
e930500a-3d62-44f4-a3ec-60bdcb163f22	73055616-4289-47ff-b647-0746db2b9164	61	COMPLETED	\N	\N	\N	2025-12-05 21:56:35.182	2026-01-16 03:33:21.677
8231ec52-6f26-4ce7-b64e-6e3bc7c0528d	73055616-4289-47ff-b647-0746db2b9164	123	COMPLETED	\N	\N	\N	2025-10-03 19:12:18.834	2026-01-16 03:33:22.056
3d3d1dd5-b51c-4d8e-8515-c02109b30c57	73055616-4289-47ff-b647-0746db2b9164	219	COMPLETED	\N	\N	\N	2025-10-08 05:26:00.933	2026-01-16 03:33:22.398
a742a552-59f2-4128-a2d4-313e36ff8cd0	73055616-4289-47ff-b647-0746db2b9164	50	COMPLETED	\N	\N	\N	2025-10-09 19:30:26.164	2026-01-16 03:33:22.762
cb49bfdc-9835-46a7-8730-eb31d768aa09	16c8944f-6677-4108-95f8-0ac517b06765	434	COMPLETED	\N	\N	\N	2025-12-15 07:35:17.667	2026-01-16 03:33:23.388
f7d0e381-1f27-4e46-a24a-195cecbc8d9b	dc9764fa-cf71-4a63-bb65-21445bd6542a	415	COMPLETED	\N	\N	\N	2025-10-14 19:08:02.422	2026-01-16 03:33:24.07
39aab3f5-cb39-40e4-9195-66f10d55468c	dc9764fa-cf71-4a63-bb65-21445bd6542a	364	COMPLETED	\N	\N	\N	2025-11-16 17:59:27.387	2026-01-16 03:33:24.347
32c14abe-202c-458a-bb9e-594c51498b46	4a2e81fa-875a-4597-bef4-2774ba17aaec	112	COMPLETED	\N	\N	\N	2025-12-17 13:55:22.737	2026-01-16 03:33:24.89
8eb10aba-bf7c-46f1-afa1-c76cc8d43107	4a2e81fa-875a-4597-bef4-2774ba17aaec	470	COMPLETED	\N	\N	\N	2025-11-22 03:39:23.047	2026-01-16 03:33:25.164
b1a348cd-550d-498f-9783-9cbd16287a3e	4a2e81fa-875a-4597-bef4-2774ba17aaec	267	COMPLETED	\N	\N	\N	2026-01-03 14:29:28.476	2026-01-16 03:33:25.498
0305d996-b641-4c45-88b1-83ed7e7b7005	dbb61217-2d8f-4c33-9888-11dda6ced1a7	436	COMPLETED	\N	\N	\N	2025-11-12 20:07:58.674	2026-01-16 03:33:26.615
e6f34369-746e-4681-a208-65d345f29342	9e6c4784-4864-4463-b26c-361de82a35c9	392	COMPLETED	\N	\N	\N	2025-09-22 22:40:15.261	2026-01-16 03:33:27.206
2840757a-9479-4d1a-bffe-939d3260a9a1	f3ebabca-2a74-4d08-ab53-2c53a53ea094	75	COMPLETED	\N	\N	\N	2025-11-16 07:22:12.853	2026-01-16 03:33:27.804
ad3d2994-716e-4c70-819e-1bb46ab59550	eb355158-5dde-4296-8617-b4bc16f32d8d	319	COMPLETED	\N	\N	\N	2025-09-25 14:24:14.799	2026-01-16 03:33:28.414
0eee8eb6-23a7-49e3-90bf-7ab1ecae405d	eb355158-5dde-4296-8617-b4bc16f32d8d	425	COMPLETED	\N	\N	\N	2025-12-08 13:03:00.815	2026-01-16 03:33:28.695
c64bca05-7c98-452d-b82f-fabb7d030894	eb355158-5dde-4296-8617-b4bc16f32d8d	177	COMPLETED	\N	\N	\N	2025-10-31 09:21:28.448	2026-01-16 03:33:28.967
b419b9eb-7dde-4e05-ada7-6ad8ce034ab5	eb355158-5dde-4296-8617-b4bc16f32d8d	210	COMPLETED	\N	\N	\N	2025-12-04 14:27:08.183	2026-01-16 03:33:29.237
90f397a4-fa73-4f13-a158-b6b9ed24aa1c	1b771c28-10e9-4d6b-980d-de4c5cb23d80	211	COMPLETED	\N	\N	\N	2025-10-05 12:28:16.7	2026-01-16 03:33:30.17
6466505f-7136-4a47-b363-086758687591	1b771c28-10e9-4d6b-980d-de4c5cb23d80	262	COMPLETED	\N	\N	\N	2025-10-05 04:56:04.985	2026-01-16 03:33:30.456
9a5164a9-740c-4168-89c4-06961824ff91	1b771c28-10e9-4d6b-980d-de4c5cb23d80	399	COMPLETED	\N	\N	\N	2026-01-14 18:09:39.572	2026-01-16 03:33:30.759
acb8f0be-d2a6-4130-b396-91134038115b	1b771c28-10e9-4d6b-980d-de4c5cb23d80	376	COMPLETED	\N	\N	\N	2026-01-15 00:10:53.339	2026-01-16 03:33:31.031
f8db3aa1-d660-4fc9-8d0f-120e188f5ac8	1b771c28-10e9-4d6b-980d-de4c5cb23d80	224	COMPLETED	\N	\N	\N	2025-09-27 18:00:37.301	2026-01-16 03:33:31.309
6baae7b0-a113-445d-b5f5-0b7aeb9125c3	26a5458a-cbfd-455d-8129-84db5aea048a	67	COMPLETED	\N	\N	\N	2025-09-25 08:52:39.645	2026-01-16 04:25:55.201
06b4b98e-92cd-47bb-9de2-59373caa2600	26a5458a-cbfd-455d-8129-84db5aea048a	613	COMPLETED	\N	\N	\N	2025-09-29 15:30:04.823	2026-01-16 04:25:55.503
148a61e6-b8c0-4409-afe3-e36b3d1a346c	c67dec61-3b10-4300-8383-d6e184138b6a	226	COMPLETED	\N	\N	\N	2025-11-22 12:23:12.833	2026-01-16 04:25:56.049
f87fb9ad-c9ec-4ea8-9f6a-ae693e167db5	c67dec61-3b10-4300-8383-d6e184138b6a	555	COMPLETED	\N	\N	\N	2025-11-18 07:45:46.607	2026-01-16 04:25:56.317
126889a3-04c4-4d30-b4f2-1836806a1ebb	c67dec61-3b10-4300-8383-d6e184138b6a	595	COMPLETED	\N	\N	\N	2025-12-01 03:56:30.686	2026-01-16 04:25:56.589
d42ba8bb-0b3c-4d44-bcf8-879aa64c5343	c67dec61-3b10-4300-8383-d6e184138b6a	380	COMPLETED	\N	\N	\N	2025-12-16 06:14:18.663	2026-01-16 04:25:56.89
f8d18d7e-d6c1-422d-a565-8274281f9cff	c67dec61-3b10-4300-8383-d6e184138b6a	231	COMPLETED	\N	\N	\N	2025-11-24 03:58:06.97	2026-01-16 04:25:57.168
c0fcfcde-3393-4637-841a-38b3174d2116	8f5b555b-a8a8-4ec8-86ac-07634253eb6f	245	COMPLETED	\N	\N	\N	2025-12-15 19:04:39.932	2026-01-16 04:25:57.717
f896d3f1-96c1-48f5-a47c-c51aaad19050	63b0f6ec-4ebf-49da-8daa-dc7327b9728d	388	COMPLETED	\N	\N	\N	2026-01-12 19:46:57.289	2026-01-16 04:25:58.319
ab1600f0-4578-46d2-bb5a-c8485b767c01	63b0f6ec-4ebf-49da-8daa-dc7327b9728d	440	COMPLETED	\N	\N	\N	2025-09-28 23:28:37.069	2026-01-16 04:25:58.59
9fa54246-7c33-4c9e-9467-35d197b617f7	63b0f6ec-4ebf-49da-8daa-dc7327b9728d	317	COMPLETED	\N	\N	\N	2025-11-10 17:58:10.856	2026-01-16 04:25:58.875
9abf0de1-0d2b-45e6-87e2-ad9caeeacfd3	0783f03a-eab7-4673-92e6-750595d21a6d	246	COMPLETED	\N	\N	\N	2025-12-25 04:17:10.333	2026-01-16 04:25:59.411
b5726cf9-80d6-4728-bdb7-42efb9875fe7	0783f03a-eab7-4673-92e6-750595d21a6d	264	COMPLETED	\N	\N	\N	2025-10-31 08:50:53.973	2026-01-16 04:25:59.685
64a035a8-af95-401e-8c19-5d6e94c11b13	0783f03a-eab7-4673-92e6-750595d21a6d	530	COMPLETED	\N	\N	\N	2025-10-30 13:54:10.991	2026-01-16 04:25:59.952
cbd5fc7e-a064-43a0-943f-7c5fdf88c6e1	40ea8c4e-98b6-47c7-98ec-b2d4a9bf8fc3	422	COMPLETED	\N	\N	\N	2025-10-27 22:34:18.209	2026-01-16 04:26:00.488
80fec2d2-1dc5-4243-ad51-95146431c3f1	40ea8c4e-98b6-47c7-98ec-b2d4a9bf8fc3	409	COMPLETED	\N	\N	\N	2025-09-27 07:39:28.956	2026-01-16 04:26:00.764
12d20468-01ec-4186-89ef-9c98220d2016	40ea8c4e-98b6-47c7-98ec-b2d4a9bf8fc3	152	COMPLETED	\N	\N	\N	2026-01-15 02:23:48.374	2026-01-16 04:26:01.035
91ad6d1b-9505-4b99-a66b-05171d838e26	6b7b9ad4-bf40-4978-8ceb-c2c147cbafed	443	COMPLETED	\N	\N	\N	2025-10-01 12:46:26.599	2026-01-16 04:26:01.595
cf1a1cd7-1557-4d89-ab13-88e326346a86	6b7b9ad4-bf40-4978-8ceb-c2c147cbafed	155	COMPLETED	\N	\N	\N	2025-12-07 20:15:38.516	2026-01-16 04:26:01.858
edc32c92-865e-439c-a598-b2fd2f5d67bc	6b7b9ad4-bf40-4978-8ceb-c2c147cbafed	583	COMPLETED	\N	\N	\N	2025-12-25 14:05:29.751	2026-01-16 04:26:02.131
735a6097-c00b-42a1-ad83-1c2a031b109e	1ae89fbb-ec41-4eb8-9827-0546c427124e	392	COMPLETED	\N	\N	\N	2025-12-05 17:36:51.226	2026-01-16 04:26:02.695
7215260e-1bea-49ad-96fa-ed67a7f641d4	368ddf11-2c7b-4c1b-99df-78f86741cb34	356	COMPLETED	\N	\N	\N	2025-11-18 10:36:05.579	2026-01-16 04:26:03.255
9aa0a194-1d5d-4f76-b2d2-1697a0838f4e	368ddf11-2c7b-4c1b-99df-78f86741cb34	212	COMPLETED	\N	\N	\N	2025-10-05 15:42:52.628	2026-01-16 04:26:03.598
bc82c969-3a61-47cf-a2c8-75f39d524584	368ddf11-2c7b-4c1b-99df-78f86741cb34	120	COMPLETED	\N	\N	\N	2025-11-14 01:22:44.736	2026-01-16 04:26:03.867
37389c16-02b5-4f06-9179-d81e172b3813	368ddf11-2c7b-4c1b-99df-78f86741cb34	234	COMPLETED	\N	\N	\N	2026-01-14 04:59:51.752	2026-01-16 04:26:04.135
86854f63-c298-4a79-bc3c-47eb6113c4fa	368ddf11-2c7b-4c1b-99df-78f86741cb34	290	COMPLETED	\N	\N	\N	2025-09-29 00:22:49.65	2026-01-16 04:26:04.405
9de11a1a-aa19-4dfb-84d1-044360b6e791	0fd198bb-47f7-4ea8-a635-99e8c33c3141	223	COMPLETED	\N	\N	\N	2025-09-25 16:11:29.85	2026-01-16 04:26:04.964
d3428921-14a9-4603-aa13-c8f296283934	0fd198bb-47f7-4ea8-a635-99e8c33c3141	107	COMPLETED	\N	\N	\N	2025-10-17 03:42:57.896	2026-01-16 04:26:05.282
be6cbcfc-8693-4402-ab71-107e59546d34	0fd198bb-47f7-4ea8-a635-99e8c33c3141	502	COMPLETED	\N	\N	\N	2025-09-29 22:27:59.671	2026-01-16 04:26:05.556
e28aff73-c202-412e-9a98-0c5e79b7610f	0fd198bb-47f7-4ea8-a635-99e8c33c3141	343	COMPLETED	\N	\N	\N	2025-10-03 01:11:12.211	2026-01-16 04:26:05.851
910e8991-fb0c-4df3-8720-5b45902edde6	df3fd6aa-091b-4df1-9ae5-f392ef2e214b	373	COMPLETED	\N	\N	\N	2025-12-19 19:12:31.325	2026-01-16 04:26:06.476
58405cd4-4d70-4103-8558-b2e030265fb3	df3fd6aa-091b-4df1-9ae5-f392ef2e214b	320	COMPLETED	\N	\N	\N	2025-10-22 22:27:40.169	2026-01-16 04:26:06.75
07ea55e5-861d-48d9-bb33-0ccb6e681949	df3fd6aa-091b-4df1-9ae5-f392ef2e214b	111	COMPLETED	\N	\N	\N	2025-09-22 23:52:33.496	2026-01-16 04:26:07.017
72746fe5-c488-4f77-aba2-e8c09ebf55a1	df3fd6aa-091b-4df1-9ae5-f392ef2e214b	181	COMPLETED	\N	\N	\N	2025-09-27 20:26:42.34	2026-01-16 04:26:07.29
2024623b-769f-4d3e-af07-423758479940	df3fd6aa-091b-4df1-9ae5-f392ef2e214b	74	COMPLETED	\N	\N	\N	2026-01-15 05:54:55.567	2026-01-16 04:26:07.589
fc7c8066-104f-4252-889a-f9220bda5f5d	8a4936d7-ac66-42cb-bdc5-b25cdd349b2e	288	COMPLETED	\N	\N	\N	2025-11-21 08:14:12.391	2026-01-16 04:26:08.198
e960e5c6-d009-4069-86b1-01b5e0fd43d1	0cc1f3a9-e2f8-40a4-8a3b-bfa87143b023	227	COMPLETED	\N	\N	\N	2025-12-09 11:43:01.523	2026-01-16 04:26:08.747
28022d23-0116-4e92-be34-a9e3828e5d64	912dd7ed-0ce0-45df-8b3b-8529939b4401	228	COMPLETED	\N	\N	\N	2025-10-13 14:13:41.991	2026-01-16 04:26:09.602
943a0707-70cb-4b61-b5df-73c7d7065a44	912dd7ed-0ce0-45df-8b3b-8529939b4401	147	COMPLETED	\N	\N	\N	2025-10-15 14:08:41.899	2026-01-16 04:26:09.873
9869f619-5fb1-4b27-adef-25889a46b18c	912dd7ed-0ce0-45df-8b3b-8529939b4401	123	COMPLETED	\N	\N	\N	2026-01-14 14:24:20.052	2026-01-16 04:26:10.144
5eb18486-4dc4-4bf2-8669-fbf5cc5a1538	912dd7ed-0ce0-45df-8b3b-8529939b4401	657	COMPLETED	\N	\N	\N	2026-01-12 00:23:17.725	2026-01-16 04:26:10.428
875d735e-f497-437a-a766-1f5f79699411	f42eb14f-4bd5-4ba6-a31c-80ce2c3af04d	206	COMPLETED	\N	\N	\N	2025-09-27 00:16:56.781	2026-01-16 04:26:10.969
97e3dc91-6957-49a9-a5bf-7a0adcf5193d	fbb0ebc6-ef15-4411-b0c9-a1cfdb82cc89	329	COMPLETED	\N	\N	\N	2025-11-25 09:35:37.078	2026-01-16 04:26:11.803
aeea4bbc-5fa0-46f7-a9d0-abf2924d0bdc	fbb0ebc6-ef15-4411-b0c9-a1cfdb82cc89	436	COMPLETED	\N	\N	\N	2025-12-22 22:49:19.156	2026-01-16 04:26:12.101
f5d1e8ff-4de1-4585-b5cc-181d6ee46d9d	06a93bc8-2504-473f-ab57-fbb6c4bd260c	207	COMPLETED	\N	\N	\N	2025-12-30 19:04:02.321	2026-01-16 04:26:12.664
9057e250-e7de-4d9d-9311-03b1652ac71c	06a93bc8-2504-473f-ab57-fbb6c4bd260c	359	COMPLETED	\N	\N	\N	2025-12-09 00:04:05.457	2026-01-16 04:26:12.981
c32b8808-435b-4fde-a214-71f7eb545a35	b59c0b36-1855-4fad-831d-358c81b28bf1	309	COMPLETED	\N	\N	\N	2025-09-27 09:58:51.512	2026-01-16 04:26:13.584
efc79cb3-42e0-4950-9556-6d5a1583c3b2	b59c0b36-1855-4fad-831d-358c81b28bf1	423	COMPLETED	\N	\N	\N	2025-11-30 19:48:09.556	2026-01-16 04:26:13.869
c05085b1-cfec-465c-bdab-487d248a223f	b59c0b36-1855-4fad-831d-358c81b28bf1	200	COMPLETED	\N	\N	\N	2026-01-06 14:08:14.494	2026-01-16 04:26:14.139
d328e465-55f6-4dbb-951a-a638e5c8ce1b	b59c0b36-1855-4fad-831d-358c81b28bf1	210	COMPLETED	\N	\N	\N	2026-01-08 15:00:28.709	2026-01-16 04:26:14.408
3eab090f-b34a-4d93-8f1d-12e56720bbf6	9d80ead8-7b59-4be7-8775-1fe330ae8ad5	492	COMPLETED	\N	\N	\N	2025-10-20 06:34:56.043	2026-01-16 04:26:14.951
6c36e7e9-a812-44ee-ba8f-a6435e9502d3	9d80ead8-7b59-4be7-8775-1fe330ae8ad5	155	COMPLETED	\N	\N	\N	2025-10-18 15:41:02.649	2026-01-16 04:26:15.253
77f97630-206c-496d-b4a7-dab8401efffc	9d80ead8-7b59-4be7-8775-1fe330ae8ad5	199	COMPLETED	\N	\N	\N	2025-10-31 10:57:32.339	2026-01-16 04:26:15.531
a875c671-dd21-4d4d-9985-23b7815cd58f	9d80ead8-7b59-4be7-8775-1fe330ae8ad5	388	COMPLETED	\N	\N	\N	2025-10-04 11:15:55.169	2026-01-16 04:26:15.811
536e00f9-f3b4-4d0d-852d-96611c28d7b1	890c184b-533f-4053-a405-7136df16cfc0	169	COMPLETED	\N	\N	\N	2025-10-18 01:32:11.945	2026-01-16 04:26:16.348
8effdc07-d6ca-4d13-850a-f8a5b0f26724	890c184b-533f-4053-a405-7136df16cfc0	472	COMPLETED	\N	\N	\N	2025-11-23 07:27:36.699	2026-01-16 04:26:16.615
044d396a-8e3f-4a63-be22-4b3517f39dae	890c184b-533f-4053-a405-7136df16cfc0	489	COMPLETED	\N	\N	\N	2025-11-25 08:36:23.565	2026-01-16 04:26:16.888
b2c67143-c51a-42e3-b5ea-a1501067ec85	890c184b-533f-4053-a405-7136df16cfc0	64	COMPLETED	\N	\N	\N	2025-10-09 08:43:38.106	2026-01-16 04:26:17.185
5642af32-bf6a-4fa5-86d4-88cd3d385890	890c184b-533f-4053-a405-7136df16cfc0	218	COMPLETED	\N	\N	\N	2025-10-26 12:38:43.051	2026-01-16 04:26:17.454
cd92c51c-f23d-4c2f-bc24-17832651a73c	d7744df2-5452-4a91-b1a0-f4cdcd06054c	408	COMPLETED	\N	\N	\N	2025-10-23 13:57:42.831	2026-01-16 04:26:18.044
a40366d5-736b-4521-9392-dcf2d62b1f8f	d7744df2-5452-4a91-b1a0-f4cdcd06054c	411	COMPLETED	\N	\N	\N	2025-10-17 21:06:18.984	2026-01-16 04:26:18.337
9e1e342c-f7a8-493d-b659-3244ab64f702	d7744df2-5452-4a91-b1a0-f4cdcd06054c	283	COMPLETED	\N	\N	\N	2025-12-20 08:57:39.64	2026-01-16 04:26:18.601
80eccc4c-65b0-41e5-8793-ad736b7fb7e0	d7744df2-5452-4a91-b1a0-f4cdcd06054c	443	COMPLETED	\N	\N	\N	2026-01-07 11:10:13.047	2026-01-16 04:26:18.865
ab84f305-fabc-4b09-8090-ca0b0e803655	ad7a6aea-112c-41d0-ae72-6debeda8ab8d	260	COMPLETED	\N	\N	\N	2025-12-26 00:40:00.151	2026-01-16 04:26:19.428
4fc3e07f-49cf-45eb-a476-0a5b3f9afc2c	ad7a6aea-112c-41d0-ae72-6debeda8ab8d	362	COMPLETED	\N	\N	\N	2025-10-27 06:15:43.012	2026-01-16 04:26:19.698
06303a93-6300-4dca-bda5-9b909082796e	ad7a6aea-112c-41d0-ae72-6debeda8ab8d	219	COMPLETED	\N	\N	\N	2025-11-02 03:29:03.676	2026-01-16 04:26:19.966
23c15ad9-1171-4eb3-869b-d55f63f3cc1a	ad7a6aea-112c-41d0-ae72-6debeda8ab8d	448	COMPLETED	\N	\N	\N	2025-11-15 05:23:30.807	2026-01-16 04:26:20.232
5021f89c-cc0f-45b2-9177-4496fc88bda1	ffc78dc1-1187-4997-a8a0-be609c150b03	390	COMPLETED	\N	\N	\N	2025-11-21 15:12:58.95	2026-01-16 04:26:20.816
a6889659-3a02-4d9c-859d-911840d24266	ffc78dc1-1187-4997-a8a0-be609c150b03	199	COMPLETED	\N	\N	\N	2025-10-30 05:04:05.416	2026-01-16 04:26:21.105
ff198f1c-08b2-4366-84ab-019c283c2ca3	ffc78dc1-1187-4997-a8a0-be609c150b03	172	COMPLETED	\N	\N	\N	2025-12-02 12:57:08.961	2026-01-16 04:26:21.379
09233810-705d-4393-bdf2-f92bfcbfe2f5	ffc78dc1-1187-4997-a8a0-be609c150b03	595	COMPLETED	\N	\N	\N	2025-11-15 15:36:15.668	2026-01-16 04:26:21.65
538ab025-434e-4eef-b5d7-70f00f37aaad	2b9205ba-5b0a-4f3a-a996-342b9fc6617a	373	COMPLETED	\N	\N	\N	2025-11-05 05:25:52.545	2026-01-16 04:26:22.493
09e7c416-4d7b-48ed-bbbf-77c4ecbdb3c8	2b9205ba-5b0a-4f3a-a996-342b9fc6617a	50	COMPLETED	\N	\N	\N	2025-12-05 10:15:44.042	2026-01-16 04:26:22.761
82d68fe7-3ed2-46e3-8de9-225ef3e08b7d	2b9205ba-5b0a-4f3a-a996-342b9fc6617a	271	COMPLETED	\N	\N	\N	2025-12-04 15:19:41.63	2026-01-16 04:26:23.05
5963d0bb-fd88-4200-afbf-78456cdf3d93	2b9205ba-5b0a-4f3a-a996-342b9fc6617a	480	COMPLETED	\N	\N	\N	2025-10-19 09:39:31.029	2026-01-16 04:26:23.325
44874e83-9caa-42b4-9fd8-f183a8acce90	2b9205ba-5b0a-4f3a-a996-342b9fc6617a	315	COMPLETED	\N	\N	\N	2026-01-10 23:12:53.111	2026-01-16 04:26:23.615
b1f6ee34-403c-4e35-a8a3-b3f3c7f8a1cf	8c49d005-5b79-4774-8be3-e7b36d6462c9	447	COMPLETED	\N	\N	\N	2025-11-22 20:12:47.928	2026-01-16 04:26:24.168
0074698e-ef8b-4941-be26-fcefa49e9086	8c49d005-5b79-4774-8be3-e7b36d6462c9	529	COMPLETED	\N	\N	\N	2025-12-13 15:05:21.617	2026-01-16 04:26:24.44
5c363a5f-18ca-4642-a7ce-edb4914613f0	0f231968-0c04-4018-aaf2-93e29124759a	279	COMPLETED	\N	\N	\N	2025-11-04 11:45:07.489	2026-01-16 04:26:24.976
3a9b661f-cdcb-4b91-9eca-cee86b3ddc25	0f231968-0c04-4018-aaf2-93e29124759a	234	COMPLETED	\N	\N	\N	2025-10-06 16:10:41.013	2026-01-16 04:26:25.243
c20effa2-2a72-4d0f-bb44-da77481131d0	0f231968-0c04-4018-aaf2-93e29124759a	539	COMPLETED	\N	\N	\N	2025-10-02 19:10:50.637	2026-01-16 04:26:25.512
5d501754-a154-4dd9-87f1-93864cced31c	0f231968-0c04-4018-aaf2-93e29124759a	270	COMPLETED	\N	\N	\N	2026-01-04 01:56:09.797	2026-01-16 04:26:25.789
4d3f9f22-3295-459d-bf5a-03a9a0d401e9	e68fdc95-a5f3-43ee-b657-4605a6fca923	124	COMPLETED	\N	\N	\N	2025-11-11 05:36:01.035	2026-01-16 04:26:26.336
c790b1bb-678d-4e56-b4d3-366fb3b74773	e68fdc95-a5f3-43ee-b657-4605a6fca923	219	COMPLETED	\N	\N	\N	2025-11-20 03:11:39.837	2026-01-16 04:26:26.635
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."OrderItem" ("id", "orderId", "priceAtPurchase", "quantity", "itemId", "itemType") FROM stdin;
17df05d8-db7b-43d5-b65c-ef0506d17e2d	5e4a2ea4-c1e6-4044-a397-8463a060e5c2	149	1	97c08e47-c01d-414a-a3a6-643b82ce0a95	EBOOK
68c9799e-9494-4368-91d4-f33800474453	5e4a2ea4-c1e6-4044-a397-8463a060e5c2	197	1	5eef608f-b3e7-47a2-93ec-aa246db34909	EBOOK
ad3148fb-0ead-4958-b262-ad95b16f260e	5e4a2ea4-c1e6-4044-a397-8463a060e5c2	217	1	fc808678-b2e8-43e7-9132-705f49141e1e	EBOOK
f4f16db1-c537-47ca-b99f-357d644ceecc	bd302e9d-903d-457e-9f61-aed4679f0a57	196	1	2a3e63b6-28c2-4f90-9d21-7f57c4973ae0	WORKSHOP
c6c07512-73c2-4217-8609-dbc935ac5444	bd302e9d-903d-457e-9f61-aed4679f0a57	149	1	ea044225-dbcd-4b69-9a44-be4855a843a9	EBOOK
4bfeee56-3f8a-43fe-86c8-078e687d588f	bd302e9d-903d-457e-9f61-aed4679f0a57	113	1	558ef293-0f2a-4f62-b248-98ea54394307	WORKSHOP
189db9d5-e421-4c37-81e3-db3dfe08f47f	1ae6cdd0-fcd6-4cca-bc02-900134a5f3c5	210	1	96c711e1-c5c2-43ad-8965-cc6497cb9caf	EBOOK
10307ee0-3828-4a6c-aefd-6827fd6768ad	1ae6cdd0-fcd6-4cca-bc02-900134a5f3c5	226	1	4a48c9ac-e126-49b1-943f-b78ae9797c74	WORKSHOP
8048259d-4cd8-48d0-bee8-7658ff499456	996b03dc-df34-486e-b31e-d47611182291	138	1	ad14f911-d486-4495-a5ea-6a696d3d1eea	WORKSHOP
fcd757d0-f73b-4836-ba21-400e54a05482	996b03dc-df34-486e-b31e-d47611182291	167	1	2b84f354-9ab8-4041-bf49-6d865c4dc1d0	WORKSHOP
b2fba0e7-d519-4c08-910e-e61a94c0a570	e05b256f-f3c3-48b8-a53e-b356d0c7c310	181	1	9c499e75-53fc-457d-ac9f-cc9b4c6a9c42	COURSE
702c228a-dcbb-420e-aacc-8a7bad8ad24b	9644e3a5-dd83-4078-b24c-4fc6766a5040	74	1	b3ee673f-2ef9-4d35-b0e6-961e160dea94	EBOOK
708a1dc1-bca3-4f86-9db3-39b82a7a816e	4927645c-2cc9-4c49-90b1-7567f11b59b8	202	1	f45a6b57-ff7e-408d-8d1d-2b6cda01156b	EBOOK
d2c20fa1-089f-4864-9fa8-0164e3e5589f	4927645c-2cc9-4c49-90b1-7567f11b59b8	198	1	9f364bf7-cfe1-4d1b-be62-68b4ab6f1847	WORKSHOP
2f4b53d5-ca6f-4a1a-a4b8-d7e186e88cda	4927645c-2cc9-4c49-90b1-7567f11b59b8	178	1	f3b5c927-9231-439f-98c8-c8420cfe3409	EBOOK
b4c919c2-ba11-482d-bfed-017a887c3122	c9f4bfed-4c2a-431c-9c8c-9a4f146e5fb6	96	1	4276c49f-0e84-4ba3-ab41-9db0b0ad5a8e	COURSE
6c91f8a7-0e70-46e0-81b9-e65c030e452b	c9f4bfed-4c2a-431c-9c8c-9a4f146e5fb6	197	1	c624d48b-bbf8-4448-9a07-8a3fe31a6c1d	EBOOK
0d046ea1-8eaf-4495-8fd6-46146ff94342	1675c190-f649-4488-b247-6ca7b94b3729	81	1	e9985521-cb69-4497-bcbe-5ecef6c39513	EBOOK
2b3679b5-22ac-4371-9ddb-5abd313f27ec	1675c190-f649-4488-b247-6ca7b94b3729	167	1	c8a8ab01-fc29-4985-b518-bfb0353af05b	EBOOK
af3c0e84-4f07-4e71-80a0-6b8d66700640	faca132e-fc4a-458c-9e35-1982820bc872	113	1	6873e401-a1e4-4549-9bba-6274f1ab8e3c	COURSE
bcd209da-0d6f-415c-ab5a-8598423e0f79	faca132e-fc4a-458c-9e35-1982820bc872	76	1	26905fd9-f7c1-4a84-af4b-7472aa16ef4b	COURSE
f22236df-74c7-4a5b-bc35-2b1fd87aa17a	b5557098-31a2-476c-a67a-cf32d5c111c1	126	1	119e4222-fc49-4663-8600-6d16f408b602	COURSE
478e6da8-163d-41a0-a353-d7b36e7d988b	b5557098-31a2-476c-a67a-cf32d5c111c1	109	1	49177b4b-3840-4685-af7a-eb195a5b6b85	WORKSHOP
7072a6a6-34a5-401f-85d6-f6820d907db0	b5557098-31a2-476c-a67a-cf32d5c111c1	242	1	64f64507-9448-4552-ad8d-10cbd766d28d	EBOOK
375ccbc6-8234-49ee-b23e-e5b7797f7b7d	e7a72246-4783-4bb5-84c2-21b386e3e43f	244	1	8444b136-25dc-42bb-989d-05dac617b488	COURSE
6e73b9e3-64f9-4df1-891d-66cf94f05e1e	0e94b9aa-5f1f-4bb4-b4f4-e121b782ce77	244	1	c5644c76-e8ea-491d-bd77-42d930d5bcd7	COURSE
47348d45-3314-4760-9f57-6b8ac742d873	0e94b9aa-5f1f-4bb4-b4f4-e121b782ce77	143	1	f223faa6-f41d-4d33-9710-3e0abdc698d9	EBOOK
8e5a1939-848b-43a2-bebd-d38badb28fe7	565d8ca7-8887-4831-b4b4-05d6011ea95f	248	1	58b1cf93-0025-4264-94d0-5669bf97ab91	EBOOK
73aea308-edc0-483b-82bc-dcefc58bb07c	28f0a44a-07e5-42be-a861-d8657892144e	165	1	37901c14-6137-491e-960c-0f22ec3050be	COURSE
67fc1481-4fc2-462a-aef7-62eeb47b2c8c	87d94929-7cef-4ee9-ab31-0950581c3090	113	1	eddedad0-9ec2-447f-94ea-12a448f4d930	COURSE
fd11e983-35f5-476b-be10-88145e85e97a	87d94929-7cef-4ee9-ab31-0950581c3090	77	1	c381e807-14df-4996-be84-0ad138ebbdbf	WORKSHOP
bd465431-254c-4d9c-9b1f-d1870e7f8c7b	e14810ef-b894-4707-82cf-fbe7c2f5b1be	210	1	30add427-a75f-4207-9ea2-db504cfcd63f	COURSE
c44ff2d2-3c95-4d67-9fa8-b2041a1668e2	e14810ef-b894-4707-82cf-fbe7c2f5b1be	162	1	7e3465f2-70e4-4082-9ef5-9b9ecaad907f	WORKSHOP
b907ae75-d036-429f-beec-a793a0e3313e	a47679d8-e69e-4831-b26f-050024aa8f5a	97	1	947be425-08ce-4c33-bb22-4c6b1636dae2	EBOOK
555a6a94-cbe9-4036-8286-923746b0a7bc	a47679d8-e69e-4831-b26f-050024aa8f5a	237	1	7201e8bf-11d0-469f-bb0f-252ebb3c727a	COURSE
f281398e-0ccb-4431-819a-526d9d471846	096fafa7-03e4-4334-8274-b53d20d75572	77	1	2876bb20-e864-4e80-997f-a51ec1ca8226	COURSE
3aab5676-5b63-4d8c-ab3f-caada4d437be	096fafa7-03e4-4334-8274-b53d20d75572	227	1	0277a6a0-229f-4763-8ce4-c99b31822ac4	WORKSHOP
707484e7-cd97-4892-8a5b-c332a4440670	096fafa7-03e4-4334-8274-b53d20d75572	150	1	8a7def32-638c-42c1-bbde-f44ec1dfad87	WORKSHOP
3515997e-9b4b-44b2-991c-681adffe9ec0	5f28bd4f-71fe-4e2a-83f6-f22df3aa9627	138	1	a518a478-4ddc-491c-9795-a64d039b35b9	COURSE
eafbf3a4-6f1c-402f-89a6-258f886afe27	5f28bd4f-71fe-4e2a-83f6-f22df3aa9627	183	1	9f17a0b5-cb2f-45d0-8715-04f162bd1183	EBOOK
82d421e3-2dd8-4458-aec8-90de3947505b	5f28bd4f-71fe-4e2a-83f6-f22df3aa9627	73	1	8c851ba5-cba0-4859-9eec-5bec19410b3a	COURSE
a2da4b73-8a1d-4607-9ad5-90d0175eae81	75bd9b0a-77ca-449c-b3b5-dff7b89ab1d6	118	1	242972de-9347-4c8f-a618-8e2fa2c9eeff	WORKSHOP
5ece5e74-636f-4364-9c31-0e475563ed4d	75bd9b0a-77ca-449c-b3b5-dff7b89ab1d6	107	1	4bf95879-79d4-4102-94d5-d1f51507b96f	EBOOK
98791f04-2429-470b-bd9c-94bfb937f9fc	5b842488-fdeb-47b7-9385-b65000ac5fc4	68	1	066a2d93-adac-4231-967d-b79445773cc8	COURSE
265ba371-71e3-4be4-8588-9c13a075e4a7	d4f6f605-d44e-4a34-b4c7-df2c94f799bd	73	1	5bca7940-6dd2-42b5-804d-eb37590cee9a	EBOOK
680ad944-08a6-45f6-b6aa-df986ea0a987	f1c3ecd4-eb6c-49f0-9a20-258b5077a996	148	1	972fab2f-d430-4d9b-a69b-7eb1a2cc8682	COURSE
c76b4bac-d6ee-4910-94e1-1a41003a590d	f1c3ecd4-eb6c-49f0-9a20-258b5077a996	163	1	975f6755-5345-44be-8159-4ed49866d482	WORKSHOP
791e3421-61eb-46c5-b8fe-44987c75fb4c	6c4e850a-1fa4-4dd4-943c-9590821ba7b4	156	1	1e4ea781-e4ef-4724-b688-3a9277396584	COURSE
ca66202a-7ff1-4a56-91eb-f302d141b502	6c4e850a-1fa4-4dd4-943c-9590821ba7b4	217	1	8a2d237b-a3e3-45e7-9b13-f97fa7ccd5de	COURSE
ad705ea6-1740-4944-952a-9d584819735c	3013cd32-1fe2-4334-8a55-c283570049be	195	1	765ed628-a621-4131-9470-c4a2f4c0e3e6	COURSE
2c2cc545-897e-4d49-847c-0aac9dd87a55	3013cd32-1fe2-4334-8a55-c283570049be	122	1	65ebaad2-40a7-4a24-a352-0069ce727d6b	COURSE
6b2bfc6c-ffb2-4823-9e91-37b7a9d94b52	3013cd32-1fe2-4334-8a55-c283570049be	118	1	51c74917-c063-4f04-a4df-eec0eed42721	EBOOK
28a83ee4-7d9f-43bc-bd38-9c0d1f8d1ff4	f8d8957d-cd21-405c-bf57-17b44d94f0f2	146	1	a7d7d032-6b3f-4f02-892b-3d29cfbee7e7	WORKSHOP
492c368a-570f-4aca-9ae0-82104f38cdfd	f8d8957d-cd21-405c-bf57-17b44d94f0f2	226	1	90d7020a-3675-4e81-87ef-0e7afb29d640	COURSE
12a7137c-c6dc-45c8-9bde-1c8f71e22bd6	f8d8957d-cd21-405c-bf57-17b44d94f0f2	78	1	f720e54f-71c5-4877-b41a-fc4c884f6ddb	EBOOK
abb0e8eb-4f04-49f4-bced-023bca22d0ff	e86aa013-5961-4ba2-abf0-14df4ac318f7	201	1	63532f87-4272-46a9-b6fa-17b38e8d2b5e	WORKSHOP
e62af152-519f-42c3-b097-6d10a53a785b	e86aa013-5961-4ba2-abf0-14df4ac318f7	128	1	d120199a-019a-4225-9914-c664d3e29da4	COURSE
fdf2a3f8-684e-4e16-b7e4-252e0aed414c	e86aa013-5961-4ba2-abf0-14df4ac318f7	65	1	187ff4bb-c3c3-4437-9f35-5eff6e5fb105	EBOOK
e42e56af-4167-4114-beb4-0ec893e575c3	61b0ab7f-bef5-4770-86b3-256de5afbeee	71	1	8c90601a-6eea-49dc-bc28-fbec404477c9	EBOOK
735e6e83-39e8-4528-bb56-1e9e7d7bfc1c	4921b62b-acec-46fa-84ed-d0960ed697cc	82	1	5d1b4a0b-0c70-4991-8276-d94f24f22ab2	EBOOK
fb6035da-7540-4e03-bf9c-61edbe124798	c78c935a-19db-4686-a159-7786bea49f2b	128	1	b588720e-504e-4605-9f24-2e58fabd3ae2	EBOOK
369d5934-d65d-4dd8-b2e5-eec11a222d81	c78c935a-19db-4686-a159-7786bea49f2b	97	1	0c6c35d1-076a-4c96-bbab-81535ff2877f	WORKSHOP
69675535-92fb-4578-aaa8-02b92d24de7d	5972bc75-7935-4f47-8757-a0b6f466c867	82	1	a03655d6-f478-4a96-bf94-858ddef867f0	COURSE
53d5be66-a1b4-4af8-912d-b2129f73a9af	5972bc75-7935-4f47-8757-a0b6f466c867	79	1	d7d3b1f1-7271-4116-bf1f-7b757fa81b82	WORKSHOP
1ca432ee-bc6b-494b-b8df-7e302b21f4a1	c9150297-afd5-4e7c-9a4e-b25fe831aeb6	231	1	c2ee391d-3ff3-4c43-ae8b-d579dcf14a8b	EBOOK
f79e842b-bb5e-4078-8a3f-0e5dbdaaebb8	c9150297-afd5-4e7c-9a4e-b25fe831aeb6	88	1	88d0bab4-5e89-42aa-916a-8477e58de886	COURSE
b0bcf03a-78fc-45aa-8717-54d9b50e2c92	c9150297-afd5-4e7c-9a4e-b25fe831aeb6	241	1	ebc8a833-2734-4e02-a0a7-56417d11c7b6	COURSE
c4210f80-fe0a-4690-a98f-2d63b4d95c46	900a61e1-9d12-4f86-8f7b-f5821e9c136f	71	1	5e6da818-702d-4e67-9d8a-ce6efa14da8d	WORKSHOP
9174dbe8-0160-4414-a003-117a75928fb2	900a61e1-9d12-4f86-8f7b-f5821e9c136f	235	1	80b7e563-9676-4984-ae11-7b6d50dab46d	WORKSHOP
4dfdeb3b-69a9-42fa-98a6-249b263dfa85	900a61e1-9d12-4f86-8f7b-f5821e9c136f	164	1	e5dcb912-d0b6-4eb5-ac48-f0a780232803	EBOOK
6a949bc5-6365-49b2-8c6c-b8c0cf3caa26	53d94a52-98ff-49cc-9fad-bc2db7eed103	185	1	96aa0b2c-1807-4042-958f-2536c5cb643b	WORKSHOP
965df195-c9d6-45c6-86cc-babbd94e1925	53d94a52-98ff-49cc-9fad-bc2db7eed103	200	1	1fa03d31-a39f-4492-9ce7-f2f60af384df	COURSE
09277b00-0ca7-455f-8e36-a1070b05ff5e	53d94a52-98ff-49cc-9fad-bc2db7eed103	244	1	6f5fdaf8-66fb-4bba-9951-72263a5d0155	WORKSHOP
f19424b9-974e-401d-88f0-d6d6435a1c49	fff004d0-75ca-4e9b-a68f-ce30b2de77a7	98	1	49be750a-66bc-4e23-af47-53ee49d11fb3	COURSE
251b7058-fda9-4062-aec0-3da93eef62d0	fff004d0-75ca-4e9b-a68f-ce30b2de77a7	117	1	10a03e68-6b3b-45fa-9f94-7d20ff39eaa7	EBOOK
0009d8e6-68b5-4a84-8d89-9cb7a57cff2f	08488006-6d7c-4b8e-bac9-468883f0d11b	115	1	00d4aac4-6a42-4786-b727-8a8c9dd353ab	EBOOK
cb175d4e-a834-4a91-8223-efd554114341	08488006-6d7c-4b8e-bac9-468883f0d11b	145	1	a7636bdb-693b-4062-b910-0e1f2108bb56	EBOOK
fc59b196-8500-49ec-812c-b0f49ee4ef56	c6936eb0-3a93-4937-ad95-d50c45e92a28	245	1	968749b6-bc17-48b0-b0d3-3b0adcbae6b0	WORKSHOP
a065a721-f38e-4b40-b200-6e23ca06ac4f	c6936eb0-3a93-4937-ad95-d50c45e92a28	235	1	ee54c2be-6d5f-4d56-ae75-e1c5e05cc055	COURSE
a6ebf849-a8d4-458c-859f-4fb6a02bde24	c6936eb0-3a93-4937-ad95-d50c45e92a28	182	1	34d41fc7-047e-452d-8d96-bb47783bf526	EBOOK
332d89ee-d8d8-40cc-8450-47056d9991de	29290649-e414-4d8d-9452-2021b9d2aaba	149	1	4b32448e-ebfd-4fad-bbe4-9d05451ff94f	EBOOK
aa722b76-2f02-4b24-b0ac-166d2909c4a3	29290649-e414-4d8d-9452-2021b9d2aaba	86	1	1cec79cd-d5a5-4012-995e-ce4756ecf7cd	EBOOK
b338bf11-9abd-4077-a29f-d3f97610263a	3b6e93d5-a211-4b95-9b06-02f8cb51982a	213	1	d6c95079-fd54-4e54-9e44-d40348e510e8	WORKSHOP
166df138-12af-4a35-97fd-5a48969b6cf8	3b6e93d5-a211-4b95-9b06-02f8cb51982a	118	1	2c5951de-3b71-4076-8261-85bac60fe233	WORKSHOP
92541575-27d2-4d9c-9d07-c6abb4913b13	2d48443b-3ad6-4105-9890-33b3ff0161cb	167	1	d139175f-74ff-42df-a323-2160a7ae0b47	COURSE
90cf83fd-6877-4167-a417-a60069755c26	78e2ca55-5d62-44c9-ad5b-8b4db12e5012	173	1	895e6b19-02b6-44ca-8d19-00b56747d1af	WORKSHOP
64fc3378-dc41-40b5-8991-b1286c58cc37	78e2ca55-5d62-44c9-ad5b-8b4db12e5012	181	1	3bcca636-a6d1-489a-8d0e-ba440a98df5c	COURSE
f6eea5d7-3362-4925-9860-e1b1b0e8db02	c1a706ab-ac31-4e45-babe-82db5fb6aae8	164	1	33612108-0663-4578-bce8-57f8b78ee121	EBOOK
2a44cb0c-e0c4-4ef2-9c02-fa504dd9bf1f	d126c456-394a-4488-847c-ee37fad260d7	227	1	c6df711a-d7fe-41cb-8ef8-ae745aae0769	EBOOK
5a6198af-5b05-47f2-aeb3-0e78c6744171	d126c456-394a-4488-847c-ee37fad260d7	77	1	00efd5d1-32b2-4227-b1ce-31e4dc1ea543	WORKSHOP
bc3dae18-de35-445c-9111-5bb04594293a	d126c456-394a-4488-847c-ee37fad260d7	68	1	1ada4b31-58a0-4beb-b007-4b83d2a565db	WORKSHOP
e0dc715e-5f3d-45db-9f0b-5f7b72b4f51c	0acbaaac-e535-4cee-a9c3-64a2657ca006	163	1	8361d6ee-3f05-42fd-ad4c-dfbd3c9c6536	WORKSHOP
304cdaee-9e30-4695-b812-16b72430b7b3	e930500a-3d62-44f4-a3ec-60bdcb163f22	61	1	f1597707-8e28-4616-900a-8ed30d34e326	WORKSHOP
40313ccd-5557-46f4-88e5-4180070b1bc2	8231ec52-6f26-4ce7-b64e-6e3bc7c0528d	123	1	4626003c-1ca8-4415-9c5d-d5900d1c671f	WORKSHOP
a43752e0-c231-44b1-ab10-70b63cd5c1b9	3d3d1dd5-b51c-4d8e-8515-c02109b30c57	219	1	b59d8cff-a50c-4ec2-ac5c-5373d62fa18f	WORKSHOP
8ac3fafd-5aa5-4dc0-8fbf-4be119ce4bca	a742a552-59f2-4128-a2d4-313e36ff8cd0	50	1	b22b2cf1-5991-4b0f-b572-7f1972c5a6bc	EBOOK
1f7a4b8f-1402-434e-bf52-d1f19a3c9ac7	cb49bfdc-9835-46a7-8730-eb31d768aa09	84	1	99d15883-20fa-44d3-ad7a-bde762092ec3	COURSE
4ba1e309-9208-4c28-8005-5f32896cf758	cb49bfdc-9835-46a7-8730-eb31d768aa09	164	1	792993b4-ece3-48bc-93e5-f0934f7273d7	COURSE
c05483a4-28c6-4f8c-ac63-7663a200f351	cb49bfdc-9835-46a7-8730-eb31d768aa09	186	1	468b8f01-f2ec-46ac-bc61-77f5787b1778	COURSE
875e59d2-be79-437f-842f-d5002b24cb69	f7d0e381-1f27-4e46-a24a-195cecbc8d9b	222	1	dfa37335-9b86-45ca-a6d2-cb29239808cb	WORKSHOP
f9b4703d-2f95-409e-8605-d8850c333e24	f7d0e381-1f27-4e46-a24a-195cecbc8d9b	193	1	f8c7528f-051f-4828-b05c-4ab852767b84	EBOOK
bbf0e77c-85b9-4ea6-89b0-00866b99c16b	39aab3f5-cb39-40e4-9195-66f10d55468c	139	1	c44c36a3-df5c-4c6b-b6e2-57e6c4449ada	WORKSHOP
d4d34a9a-039c-4abf-bcb3-7c2d5f939eca	39aab3f5-cb39-40e4-9195-66f10d55468c	56	1	71e522bf-74ea-4d56-b608-13671f8e0573	COURSE
f507063a-99cb-446d-96f0-e0145771d419	39aab3f5-cb39-40e4-9195-66f10d55468c	169	1	75ebb34d-1b40-4be6-a0f9-fd38ee46a18a	COURSE
c181b721-7a11-42f6-b6e6-58d011a99881	32c14abe-202c-458a-bb9e-594c51498b46	112	1	4e1ce899-f2b7-4556-a038-20dd8a003587	EBOOK
debd0cf5-8cea-4b73-8c48-6f3e88617e55	8eb10aba-bf7c-46f1-afa1-c76cc8d43107	131	1	ee71a990-a547-400e-8d94-c11d65ab0a37	COURSE
3b05128d-0219-409a-93bd-b51e59076267	8eb10aba-bf7c-46f1-afa1-c76cc8d43107	205	1	29301b17-4758-4982-b986-631db8c51e44	COURSE
2a8a7a30-71c2-44dc-9a84-eac9e9109cf7	8eb10aba-bf7c-46f1-afa1-c76cc8d43107	134	1	77d335f5-e68f-480f-8ba5-8506f08a4222	EBOOK
ed8b4309-28a8-4fa1-b8b4-f681394da814	b1a348cd-550d-498f-9783-9cbd16287a3e	117	1	cd9566fc-d8df-46c4-b6f1-795761d12d69	WORKSHOP
200b19f8-51d2-4487-9161-93d398ea7da9	b1a348cd-550d-498f-9783-9cbd16287a3e	150	1	f7d31ede-af9d-4205-aa68-320444694c2c	WORKSHOP
664d1446-4ed4-401c-86d9-5b7e21de1fcf	0305d996-b641-4c45-88b1-83ed7e7b7005	224	1	a6b5527f-a648-459d-af45-f1a64113ea81	COURSE
83abe148-7d2c-484d-9ec3-a15c3b614ed5	0305d996-b641-4c45-88b1-83ed7e7b7005	212	1	a11b4c36-e770-4922-8e65-e5ed90c0efba	WORKSHOP
2bfa1b12-d268-4404-a9f5-ef8190d84240	e6f34369-746e-4681-a208-65d345f29342	89	1	ae2a18f4-7c52-4918-a307-c044330253f8	EBOOK
0a28bdab-52af-42d1-9f67-70f4a861644a	e6f34369-746e-4681-a208-65d345f29342	211	1	9b5a7c45-acc4-4247-96be-4e09115d24d5	COURSE
7208e3f5-063c-40b0-a39f-488888fdfdd5	e6f34369-746e-4681-a208-65d345f29342	92	1	92f7be4f-ca3b-454d-9978-d502e677772c	WORKSHOP
e036c485-0a93-4a18-b044-d0f31ca03d4d	2840757a-9479-4d1a-bffe-939d3260a9a1	75	1	78731b42-2258-444e-aaad-aae818bba447	COURSE
36af7b23-d6c7-4a88-8757-686ee09efb7c	ad3d2994-716e-4c70-819e-1bb46ab59550	81	1	2777fe42-4b3a-4e09-87a5-c99969b94280	EBOOK
94194e7f-d0a7-4671-81aa-efbfd682112a	ad3d2994-716e-4c70-819e-1bb46ab59550	238	1	a958d5eb-2de7-44c5-889d-6323b5d34264	COURSE
017d841b-b5f1-42b4-83f6-23f4581dc062	0eee8eb6-23a7-49e3-90bf-7ab1ecae405d	144	1	42d6fea8-e16f-4756-8791-a9353dc65320	COURSE
cc9e515e-e9b8-410a-b834-2d813b55ca27	0eee8eb6-23a7-49e3-90bf-7ab1ecae405d	84	1	28a48218-c583-4ba9-8343-7d29ad96be3e	WORKSHOP
c022bc85-4ef5-4b95-856d-64b7fbacfa4a	0eee8eb6-23a7-49e3-90bf-7ab1ecae405d	197	1	d1d94e0f-1dbd-42b7-9201-5dc5e2334e1c	EBOOK
34807ba4-6479-4f89-919c-b0b0dc101002	c64bca05-7c98-452d-b82f-fabb7d030894	58	1	161a93a9-eabc-402d-8de9-15c4afe23400	WORKSHOP
85474dce-e482-4428-89e6-0a9b3b3595ec	c64bca05-7c98-452d-b82f-fabb7d030894	119	1	390cbc70-ca6b-41e8-8a22-61912a6e5e45	WORKSHOP
a6cfe133-5fd4-4ed5-94aa-aa3d76cb3c46	b419b9eb-7dde-4e05-ada7-6ad8ce034ab5	210	1	1ad129cb-babf-4185-b06e-1dcfc5dc6303	WORKSHOP
1fa6e33d-41e1-4950-9a6b-5e7f7efa50bb	90f397a4-fa73-4f13-a158-b6b9ed24aa1c	87	1	3437c1e7-1ed2-4716-8d9a-8ab836909075	EBOOK
182b2504-5aa5-4a24-830b-00f0a14f30f1	90f397a4-fa73-4f13-a158-b6b9ed24aa1c	59	1	dec3bf60-bb06-4bd1-8200-6e95a7d288ba	WORKSHOP
678de0cd-ad29-470b-ad44-d33edf75a871	90f397a4-fa73-4f13-a158-b6b9ed24aa1c	65	1	95b5af8e-225f-4568-91ba-645edbf92bbb	COURSE
af147919-cc33-46ed-8d52-cce0012b1f79	6466505f-7136-4a47-b363-086758687591	65	1	dfe59f3d-7fe1-424d-ad65-786ee953d4c7	WORKSHOP
4be53821-c180-46e0-bc0a-655da7c7d87f	6466505f-7136-4a47-b363-086758687591	85	1	d995ef25-e34b-4d53-b9de-23175782a728	WORKSHOP
4e4b41b0-ccfd-47b4-8da5-514c6aa7a023	6466505f-7136-4a47-b363-086758687591	112	1	b803d8d0-427d-4789-8aee-ea02d3785280	EBOOK
8ac4adf1-6813-4e5f-81c5-c9e4f4afb6e2	9a5164a9-740c-4168-89c4-06961824ff91	110	1	41e986cd-7726-483c-9b70-c2a05bc60c79	COURSE
852386a7-53e9-4002-839a-2d09f2075919	9a5164a9-740c-4168-89c4-06961824ff91	197	1	e7ddf3ea-607b-41e8-98a1-b4e62fe904f2	COURSE
87d3c89d-f65b-4f7e-b75c-2dff1a966d6d	9a5164a9-740c-4168-89c4-06961824ff91	92	1	470e7bb9-e797-4b46-8fe7-c857e7706aab	COURSE
05aee59c-a98b-4040-a357-e0fa5b9c69c2	acb8f0be-d2a6-4130-b396-91134038115b	174	1	d33e280d-c76d-4bf2-9d07-bff9ded8753c	WORKSHOP
702f10b5-d3ba-451b-99b2-6a8c87b63e6e	acb8f0be-d2a6-4130-b396-91134038115b	113	1	f23310cd-15f3-4f04-a86f-52ca1ccbe662	EBOOK
57bf514d-56de-4832-82cd-df894bf32c5f	acb8f0be-d2a6-4130-b396-91134038115b	89	1	eb13041a-08d3-47ec-8d3e-f88ea9265298	COURSE
9b68bf9b-d1a2-4360-a23b-556548f0099b	f8db3aa1-d660-4fc9-8d0f-120e188f5ac8	100	1	5f5f4707-7a61-42ea-8c6c-de2b1c84828d	WORKSHOP
010bf9dd-2b77-4d89-a5a9-f5ad4c649c77	f8db3aa1-d660-4fc9-8d0f-120e188f5ac8	69	1	99ec135f-1e54-4e8e-9d87-d5f82e166b97	COURSE
0cb25371-ebd8-45d3-a965-612d15bf1509	f8db3aa1-d660-4fc9-8d0f-120e188f5ac8	55	1	e8917cfa-1fd1-4d1d-abfd-9b3f49caa22e	WORKSHOP
ca3ed11c-17b6-4c3c-bcdf-bcf94d0506b5	6baae7b0-a113-445d-b5f5-0b7aeb9125c3	67	1	0457b072-cc0f-40a2-b139-f83c74dcb9a2	WORKSHOP
3a9867f5-2f0e-4685-ab84-ba45b4615901	06b4b98e-92cd-47bb-9de2-59373caa2600	124	1	21d7141f-2278-4372-bb3f-f63161809212	WORKSHOP
b3305809-9ee8-4efb-80f3-ad5504409512	06b4b98e-92cd-47bb-9de2-59373caa2600	241	1	63fcbb79-cd59-4f50-99bd-929d09fa282b	WORKSHOP
1502aab7-87b4-44a7-a221-bf1da032bba7	06b4b98e-92cd-47bb-9de2-59373caa2600	248	1	4885e480-3035-4aaf-9a35-b6a4393e3fce	EBOOK
07eacd82-f42f-463a-994b-b5bb7efb5680	148a61e6-b8c0-4409-afe3-e36b3d1a346c	74	1	3a0d4eaf-9d4c-4b55-a3bf-9dd04a5e36c5	COURSE
26cf8bc9-b4c6-407b-b39f-2830ea1f5b87	148a61e6-b8c0-4409-afe3-e36b3d1a346c	152	1	cf841bcb-a8b4-40ee-9175-a829fca34090	WORKSHOP
32c3ecf1-bae8-442c-8dab-0057c2fa2a8c	f87fb9ad-c9ec-4ea8-9f6a-ae693e167db5	237	1	1557dee1-05e0-4bcd-87cd-b7fe4ae09c4d	COURSE
d5af7745-6f21-4e60-adf2-0d2e9fbbc3ac	f87fb9ad-c9ec-4ea8-9f6a-ae693e167db5	207	1	1003d08e-3e7b-4929-8715-08391f43f5d0	EBOOK
ad4fa48a-875f-44d5-9fc3-65a7c4b89ee9	f87fb9ad-c9ec-4ea8-9f6a-ae693e167db5	111	1	c4ca84be-0131-4685-b9f0-e7e169f0fc11	EBOOK
878aac45-8928-448c-bf02-da8dd32b0bbc	126889a3-04c4-4d30-b4f2-1836806a1ebb	246	1	2034a912-1c85-444c-8d2e-f5ad93ed5d28	WORKSHOP
62a6cc9f-72d0-4e1e-9d13-028a56094431	126889a3-04c4-4d30-b4f2-1836806a1ebb	221	1	cdf04d7f-74b6-42b6-9899-ca3a80ee963f	COURSE
927f246b-736a-4010-8de0-5cb3bf3cc991	126889a3-04c4-4d30-b4f2-1836806a1ebb	128	1	a4a41059-b02c-428d-a5e6-6ab5abc532cb	WORKSHOP
a615ae46-c6cf-47a2-89fe-5c0cd98cdd23	d42ba8bb-0b3c-4d44-bcf8-879aa64c5343	186	1	84bf2fa1-407c-456d-9042-5f2932183b1e	COURSE
06e9d7b9-fe16-4f16-a724-75f7f8793834	d42ba8bb-0b3c-4d44-bcf8-879aa64c5343	194	1	9a9ad5b6-03e5-4326-a77c-2862de965f5b	COURSE
c4d20a0a-d903-45fc-9d9a-de4e40d297e4	f8d18d7e-d6c1-422d-a565-8274281f9cff	231	1	3babbb6f-8e74-4f1a-ba3b-4e26df3d1f95	WORKSHOP
3cc50217-ed5d-424d-a82d-d85f9f412dfa	c0fcfcde-3393-4637-841a-38b3174d2116	245	1	67c8e004-f3c9-4e07-acc1-a2767566a9a3	COURSE
c8a11edf-c250-49af-a82e-8c295acfafcd	f896d3f1-96c1-48f5-a47c-c51aaad19050	242	1	f6b5733a-29e9-475e-8cce-408b5441e0f7	COURSE
9b0c89d6-6b1b-4f5c-a69b-e012de302ae9	f896d3f1-96c1-48f5-a47c-c51aaad19050	146	1	f2dc9e99-3263-42df-a879-ba74e9d89b33	EBOOK
b165fa0e-d660-4a96-a6e5-c500fe576fcc	ab1600f0-4578-46d2-bb5a-c8485b767c01	74	1	c0d5feee-7070-4a44-bc4b-22c24fbc580f	EBOOK
5144eb09-c9b4-41b2-88cb-4a6a1af950d1	ab1600f0-4578-46d2-bb5a-c8485b767c01	226	1	296c1000-c573-4b8f-a33f-28ab35f1f47d	WORKSHOP
090e8f5b-da54-4ff3-80f9-7bf6357e99b0	ab1600f0-4578-46d2-bb5a-c8485b767c01	140	1	0bf35bf1-2c25-48d5-94ba-f055bc7037a2	EBOOK
75c5bc76-43f0-44a8-b5f9-e3a70d1a8dca	9fa54246-7c33-4c9e-9467-35d197b617f7	122	1	93826189-3170-44c3-ac0f-f07bfdcff168	WORKSHOP
c499e0cb-f7f5-48e6-ad19-94e825156a8c	9fa54246-7c33-4c9e-9467-35d197b617f7	195	1	df7d1342-926b-43a5-b276-35b90ea76f5d	COURSE
c638aa4a-f262-4aba-9b9f-4b9efc9fd520	9abf0de1-0d2b-45e6-87e2-ad9caeeacfd3	246	1	dd90fe1b-c868-40b4-898b-be3236823440	EBOOK
4eed52cb-8172-4197-a134-86541ebf5aa0	b5726cf9-80d6-4728-bdb7-42efb9875fe7	162	1	0d5f5bfb-b2e2-4561-b299-0a72abb189c7	EBOOK
ab069912-8508-4631-80f5-691cc3bc552f	b5726cf9-80d6-4728-bdb7-42efb9875fe7	102	1	4640bed6-924c-4fa9-ba63-7cecfb45f656	WORKSHOP
36a36483-4f6f-426c-a462-662b7fd702ba	64a035a8-af95-401e-8c19-5d6e94c11b13	111	1	1c6d2f97-2b22-446c-ad25-216e4b0fd06d	EBOOK
cddc2a17-e15e-4238-836a-951d67e5da1b	64a035a8-af95-401e-8c19-5d6e94c11b13	192	1	bc65ef01-0304-4cf7-90f8-770d7c20394f	EBOOK
30ec06fc-f0f6-452d-98ea-a7351142877f	64a035a8-af95-401e-8c19-5d6e94c11b13	227	1	c0d041a0-5c7d-44a1-9ce6-233ac99fe1a5	EBOOK
d170064e-045e-4a99-9f4e-01d7e7ca19d6	cbd5fc7e-a064-43a0-943f-7c5fdf88c6e1	108	1	af0f442d-d802-4fe8-a361-2a8b2dca939c	EBOOK
ad3fe722-3cc5-40e7-a5db-cc60ac162f5b	cbd5fc7e-a064-43a0-943f-7c5fdf88c6e1	218	1	d72a272a-6ede-48ca-9d53-3ffbfdde53c8	EBOOK
7e530781-4f68-4b14-a6a7-f392b71b39b6	cbd5fc7e-a064-43a0-943f-7c5fdf88c6e1	96	1	70d1ae64-3df4-4111-80ce-10d0959f35e4	COURSE
4e724ed0-3df0-43ee-9b44-bd929c32b638	80fec2d2-1dc5-4243-ad51-95146431c3f1	208	1	da47e4ff-bff4-473d-b859-2318ac07f773	WORKSHOP
76a97f37-2dfc-462c-ac1b-cc5f443b5f9e	80fec2d2-1dc5-4243-ad51-95146431c3f1	201	1	49985c92-e850-4243-9f11-94627fd0fd3a	WORKSHOP
c79aa5cb-f061-4343-a5d4-840299427067	12d20468-01ec-4186-89ef-9c98220d2016	152	1	d2846c09-516b-4c84-999b-1e2bb2b79b98	COURSE
08a6e853-ba6e-45ab-a88f-91d8320dc24b	91ad6d1b-9505-4b99-a66b-05171d838e26	79	1	c62e4ba2-72e4-4a94-9966-de7a2ce432ce	COURSE
e088f2a6-0236-4fd8-958f-7a412b5b339d	91ad6d1b-9505-4b99-a66b-05171d838e26	181	1	32a65df6-f103-4b77-a1e9-63b3a215a51f	EBOOK
dac142b9-f223-47f6-ad3a-e8c8d9991dc0	91ad6d1b-9505-4b99-a66b-05171d838e26	183	1	2723c75f-f3fd-4f06-b2a1-692429f65735	WORKSHOP
bab4ebc2-1360-44cf-92cf-c5168b413088	cf1a1cd7-1557-4d89-ab13-88e326346a86	155	1	b9c226b3-7de1-4665-992d-7e50f9654ba1	EBOOK
ac5ae7b7-0353-4ecf-95c7-af128148d80f	edc32c92-865e-439c-a598-b2fd2f5d67bc	225	1	307c8b0a-2c59-4b94-a17b-c81d53965395	COURSE
cdfb57bd-ec13-47a2-aa86-d4def1066603	edc32c92-865e-439c-a598-b2fd2f5d67bc	235	1	74402acf-6410-48b0-84b4-e88acd9bc742	WORKSHOP
ddc6f9ee-2ee7-4ce9-98d5-c2bfb9fafdf2	edc32c92-865e-439c-a598-b2fd2f5d67bc	123	1	4881150a-c42e-4bf6-ba84-7c911e33ffed	COURSE
4aeffabb-5f8c-4fc2-bed3-884a68340f81	735a6097-c00b-42a1-ad83-1c2a031b109e	243	1	703aef5e-cd2c-4b26-a614-777b77516ec9	WORKSHOP
460d7be5-dee3-4332-a08d-875f4ac7a6ce	735a6097-c00b-42a1-ad83-1c2a031b109e	149	1	5544b641-033f-48cb-9f68-c7b64391b111	EBOOK
fc2819fe-5b94-49d8-9d2e-625859c54033	7215260e-1bea-49ad-96fa-ed67a7f641d4	201	1	52769dcd-0d8f-4d95-87e1-26cca9c15322	EBOOK
e4602f95-0ccd-4203-85bf-f19246c6bedd	7215260e-1bea-49ad-96fa-ed67a7f641d4	155	1	2bf5046e-3bcf-4649-86dc-90138128b403	COURSE
47f0e456-1250-464d-9a57-510392121e35	9aa0a194-1d5d-4f76-b2d2-1697a0838f4e	212	1	293db829-20a7-4290-b309-4e8bb071d2e0	EBOOK
2e9aed7e-f795-48c2-8b0a-aa064c170057	bc82c969-3a61-47cf-a2c8-75f39d524584	120	1	110bed8c-7b9b-47ab-8bf9-cfbb00d3a1bf	COURSE
543eef0b-d76b-445b-af7e-9df8ea24f5d8	37389c16-02b5-4f06-9179-d81e172b3813	234	1	0bea5d8a-f81d-44a3-920d-06499a7cd14d	WORKSHOP
ece1cdb6-07d1-4a63-ba3b-df2622fe96d9	86854f63-c298-4a79-bc3c-47eb6113c4fa	156	1	4fc5991c-2b87-41f1-9054-1e214e036af9	EBOOK
d2d20037-9839-47da-9b05-436a0f2304aa	86854f63-c298-4a79-bc3c-47eb6113c4fa	134	1	a787d927-fb2c-415f-87cd-3c24bcfec012	WORKSHOP
861eec1b-c532-47e9-bab4-a1a2882a4fbc	9de11a1a-aa19-4dfb-84d1-044360b6e791	223	1	7c1f38b2-d77c-4e50-8456-884dac3a1c83	COURSE
0c20f28a-180d-4f63-84a2-44c2ac2f1bf7	d3428921-14a9-4603-aa13-c8f296283934	107	1	8b280f54-5f51-4797-bb1d-38965154efdb	COURSE
b4221d37-2dea-44c9-9a4c-b58f0922bdfd	be6cbcfc-8693-4402-ab71-107e59546d34	223	1	6c3b5d9e-56f9-4cf4-a8c7-eafa1c643b4c	WORKSHOP
9b83668c-1808-47e0-b4d5-e2c5880f820e	be6cbcfc-8693-4402-ab71-107e59546d34	87	1	e1c53133-f7b3-4330-9a73-3df359adcb2d	WORKSHOP
deaf2131-d5ac-438d-8581-68d3ae62e08b	be6cbcfc-8693-4402-ab71-107e59546d34	192	1	8041dc9a-62be-4ba4-ba4e-7e044bd14f98	WORKSHOP
56a89d36-7b07-41e4-ac17-c587a78e4b4e	e28aff73-c202-412e-9a98-0c5e79b7610f	165	1	404c0a91-3a3a-4ae0-8074-d9a5feffff0b	WORKSHOP
75a876e6-e677-4ece-b323-fc9d53d699fd	e28aff73-c202-412e-9a98-0c5e79b7610f	178	1	cc1c72ed-442f-40bf-995f-2682614a29f1	WORKSHOP
5439fbcb-04ce-4e1f-9762-bca8b4ead0e9	910e8991-fb0c-4df3-8720-5b45902edde6	155	1	07ab583b-a23a-4c77-9c16-ccd14b7b3deb	EBOOK
b6a79e44-8f10-4ba3-b65f-e44c003c9fba	910e8991-fb0c-4df3-8720-5b45902edde6	218	1	f72d0b31-ae74-4cbf-b27c-1373659130ee	WORKSHOP
f211eabd-fbbc-400e-916b-2a88d6d2b223	58405cd4-4d70-4103-8558-b2e030265fb3	147	1	db1e1023-f2f3-425d-ade4-18234ebfb690	EBOOK
7b1ec6f6-632c-41b0-a037-3e9e3b935f05	58405cd4-4d70-4103-8558-b2e030265fb3	94	1	2394ff75-d643-4b8e-bdaa-070525e34bb4	WORKSHOP
4969cba1-9040-4319-994a-eae8ecced9f1	58405cd4-4d70-4103-8558-b2e030265fb3	79	1	14445d80-8b8d-43bf-997b-db8d4c7547e3	COURSE
8f54df00-bb9f-4edc-9a3b-e390e0ff81ca	07ea55e5-861d-48d9-bb33-0ccb6e681949	111	1	87bd6926-1e25-43cd-b77c-8a71dcb48103	COURSE
44780fd1-4dd1-4fd7-a178-6b11e6c35d0a	72746fe5-c488-4f77-aba2-e8c09ebf55a1	181	1	61909f9c-8980-4d88-a629-8cf22b980fce	EBOOK
30e12b7e-d90c-4018-84f8-83205a5848db	2024623b-769f-4d3e-af07-423758479940	74	1	46eab749-9431-48a1-8bf8-bec972a296d1	COURSE
8c63a9bb-c98e-45d3-abf6-036a14806ac4	fc7c8066-104f-4252-889a-f9220bda5f5d	208	1	c276839a-e782-4222-b4af-2d9dc94e8b86	COURSE
243f3354-cb57-4812-9890-61774571f67e	fc7c8066-104f-4252-889a-f9220bda5f5d	80	1	7c53b629-dfde-4054-a393-e8702b71c74c	WORKSHOP
a5de4b90-22e9-438c-91f3-ee2d937813c5	e960e5c6-d009-4069-86b1-01b5e0fd43d1	170	1	9fdf9b82-d3fb-48ab-8ddc-2d476d021d10	COURSE
81264ffe-cfc5-4144-8127-60f8703ff9de	e960e5c6-d009-4069-86b1-01b5e0fd43d1	57	1	326f2e74-674c-438e-b87a-c6d3dda47285	WORKSHOP
67d5b423-c21d-4dee-988f-3aa99ee51e19	28022d23-0116-4e92-be34-a9e3828e5d64	228	1	df6cea02-e202-45af-a9d4-4248cfe29334	WORKSHOP
27d4a59a-5bc2-4bda-8129-5c6ffa731203	943a0707-70cb-4b61-b5df-73c7d7065a44	147	1	8c5cb5dd-b199-45d0-b93d-a1a690e88fc9	WORKSHOP
34cc2d8b-e08d-429a-b6ea-6ae5a05d8984	9869f619-5fb1-4b27-adef-25889a46b18c	123	1	ce910080-447c-4b89-a865-d91c366ed827	WORKSHOP
89ad8509-125a-4310-9c9e-597b681da710	5eb18486-4dc4-4bf2-8669-fbf5cc5a1538	249	1	31925420-2954-4555-80af-5ac32f00bb06	EBOOK
5746102d-474a-4bb3-99e1-096a7eae18cf	5eb18486-4dc4-4bf2-8669-fbf5cc5a1538	186	1	56d4717a-9027-46bd-8616-c847dbe45ed3	COURSE
227cbc4c-ed48-4e7a-8a27-6263cb8f55f8	5eb18486-4dc4-4bf2-8669-fbf5cc5a1538	222	1	de2add8d-3324-4550-ace0-9f30753486f4	COURSE
0b8c0bff-2e70-48df-95cf-6b5aa0026e29	875d735e-f497-437a-a766-1f5f79699411	206	1	62c9cd54-b4aa-40ed-bd40-796c386ea408	COURSE
4eb68f8b-765f-45d9-b998-2fa4e7a1f295	97e3dc91-6957-49a9-a5bf-7a0adcf5193d	52	1	819fdc45-f728-417d-9a34-a6da824e4d15	EBOOK
850c45f1-b2aa-4b11-a9bd-8d375a3cc3df	97e3dc91-6957-49a9-a5bf-7a0adcf5193d	160	1	270c8296-93fd-4975-9295-d01e1c3bf7c2	WORKSHOP
9a357452-cb05-4908-a0d8-924151400d21	97e3dc91-6957-49a9-a5bf-7a0adcf5193d	117	1	096a38e4-c116-47fb-bc1a-5c77146f64c0	COURSE
2aa6c63d-13c9-49c9-9788-785ecf3222ca	aeea4bbc-5fa0-46f7-a9d0-abf2924d0bdc	83	1	e620a753-2297-403f-88c5-30480cf6edaa	EBOOK
87278557-594d-469b-aa78-b5221c4d6597	aeea4bbc-5fa0-46f7-a9d0-abf2924d0bdc	123	1	eac8a025-fc8d-44c4-849d-0ed1bb3ea367	EBOOK
659287ef-25cb-44b9-b831-552d6a78f178	aeea4bbc-5fa0-46f7-a9d0-abf2924d0bdc	230	1	19ca93ac-ada1-4e8f-8e16-a8a146fbe410	COURSE
411aae53-c919-4dae-b6e6-bdbebbb013ae	f5d1e8ff-4de1-4585-b5cc-181d6ee46d9d	147	1	dc39b6bf-f77c-45f8-9d18-d7f0e37c9b86	EBOOK
9b6dd156-45bb-4c43-a3ca-7cfe87a39297	f5d1e8ff-4de1-4585-b5cc-181d6ee46d9d	60	1	be8ed01e-894e-400e-89f7-c6a8e57b2e5d	COURSE
5aaec096-760b-44ef-9999-3c24d6ad6e70	9057e250-e7de-4d9d-9311-03b1652ac71c	174	1	00eb5c76-6c61-489b-89ba-a0d706f373b2	EBOOK
c5bb4452-cab2-40c3-b8b4-95b54e3b714d	9057e250-e7de-4d9d-9311-03b1652ac71c	185	1	570f573b-d663-42ca-8c56-d229cc950a8e	COURSE
962fb50e-55ac-4008-9372-169fc16cec4a	c32b8808-435b-4fde-a214-71f7eb545a35	82	1	2b192dbd-82d4-4e4d-b4aa-c69b37467d85	EBOOK
c0872417-28d0-4e59-9dae-238dae70e8c4	c32b8808-435b-4fde-a214-71f7eb545a35	147	1	4fcf41c7-29f3-418a-b513-17eea9c23026	WORKSHOP
98fc252e-cf8f-4e2a-b607-b89012808855	c32b8808-435b-4fde-a214-71f7eb545a35	80	1	eaa80ea6-9b2b-456f-b055-a1a2d3f76efa	EBOOK
2bb35c30-bff4-433a-a1e9-1068cdf1ac9f	efc79cb3-42e0-4950-9556-6d5a1583c3b2	78	1	413e5828-595c-41b1-80b8-353106dcfc7b	COURSE
8d5795e8-d38c-4015-9506-e7a8359377a8	efc79cb3-42e0-4950-9556-6d5a1583c3b2	204	1	a26f08fc-585b-4583-86be-42172fbf5c87	COURSE
1e30b3c4-e878-411c-816c-9f4db76f283b	efc79cb3-42e0-4950-9556-6d5a1583c3b2	141	1	9fb4a96f-6330-4cf8-bcaa-3e2830dfe06b	WORKSHOP
89a953b0-f284-46fc-9810-ac7babda2333	c05085b1-cfec-465c-bdab-487d248a223f	200	1	16a50573-8020-4278-ad12-88cd3194c45a	WORKSHOP
3b6df504-70a0-4f63-a21e-10f8152748e6	d328e465-55f6-4dbb-951a-a638e5c8ce1b	76	1	41c248d5-6e1b-4ad9-84ca-93045af93a20	EBOOK
1e2e973d-b9b8-4e5a-b315-b51756522a5f	d328e465-55f6-4dbb-951a-a638e5c8ce1b	77	1	5c2304c8-07f4-4d40-a7ae-b2f1b5af4aea	EBOOK
77b87d9f-433b-48c9-8249-078ecb727383	d328e465-55f6-4dbb-951a-a638e5c8ce1b	57	1	0e589a4f-928b-46cd-bc64-16555994be93	COURSE
cc434342-8590-46ca-aa22-31dd3104a025	3eab090f-b34a-4d93-8f1d-12e56720bbf6	225	1	a11c0432-d762-4a5d-910e-93162eb5e56b	COURSE
5ac46307-217a-4d96-8bad-15d1775920e1	3eab090f-b34a-4d93-8f1d-12e56720bbf6	116	1	ee93dc67-7aac-4867-bb7a-991dd8fc30d9	WORKSHOP
dace8755-adca-4f34-afd6-4214822a6bc7	3eab090f-b34a-4d93-8f1d-12e56720bbf6	151	1	594740f2-e45b-485b-8791-205be11d47e7	WORKSHOP
1353b065-9618-4521-b1eb-c40bbc94cc87	6c36e7e9-a812-44ee-ba8f-a6435e9502d3	155	1	b848ade9-910a-48dc-913d-c00bda9136a5	COURSE
bed20286-0b85-484c-bbbe-6a6856759e28	77f97630-206c-496d-b4a7-dab8401efffc	199	1	e9cf5f2f-efbe-468d-bc62-25d2e3559b3e	COURSE
eb45f744-f605-49a6-9268-d484e9a0eaa4	a875c671-dd21-4d4d-9985-23b7815cd58f	173	1	dfd8f097-3bb8-4004-9f6e-6d5876b751fb	EBOOK
022065aa-fae6-4f32-9ef2-aeb5a137d006	a875c671-dd21-4d4d-9985-23b7815cd58f	215	1	d95f5da5-4897-48b1-845d-a3ade5b7a06b	WORKSHOP
eeb31448-0794-48f1-990d-b548d8142a79	536e00f9-f3b4-4d0d-852d-96611c28d7b1	169	1	915d3d87-5eaa-4d09-8a24-4dacf4c09968	EBOOK
2407981b-dfaa-4091-a07d-ba3c27a46c2f	8effdc07-d6ca-4d13-850a-f8a5b0f26724	182	1	5aaadea9-cbf2-4dcc-9747-917529e9948f	EBOOK
ed27d4b4-c378-4233-8bdc-bba505d11e0a	8effdc07-d6ca-4d13-850a-f8a5b0f26724	136	1	4ccddb96-1e3c-428f-8da7-de7f5be4383f	WORKSHOP
d5737c8d-7058-4dad-80c9-7d004ba883ea	8effdc07-d6ca-4d13-850a-f8a5b0f26724	154	1	2ba11abf-04e2-43a4-bc1b-2589d2bf2b77	WORKSHOP
75ef30a4-19cc-41fc-a3df-6f39f9f1319b	044d396a-8e3f-4a63-be22-4b3517f39dae	135	1	2cde3a45-6698-4db4-9dda-7c2ebab11418	EBOOK
04ef07ac-a0c4-4e39-a6a8-4ca7f547354d	044d396a-8e3f-4a63-be22-4b3517f39dae	127	1	a03033d1-51b2-49e8-a284-075b574b9485	WORKSHOP
1c7d8b01-7ab3-48eb-8bc9-7951e35da65a	044d396a-8e3f-4a63-be22-4b3517f39dae	227	1	31f39e54-b31a-4f99-b7bb-c0bc8a5350c8	WORKSHOP
861f7de9-4d16-4e46-8412-255a42c2a947	b2c67143-c51a-42e3-b5ea-a1501067ec85	64	1	00b275c8-63d0-487c-b966-69b9e7840a55	COURSE
a381d9c7-2722-4f25-8796-5b6af7fa7eb6	5642af32-bf6a-4fa5-86d4-88cd3d385890	102	1	845b199d-e3ba-48d0-b18d-f1180b507b90	COURSE
df6d5ca1-592b-418f-9b7e-6301a40287c8	5642af32-bf6a-4fa5-86d4-88cd3d385890	116	1	71e77a98-6dce-4f8c-a2c4-1cc205499b7f	WORKSHOP
fa476b20-8737-44f7-9074-cbae57c6965b	cd92c51c-f23d-4c2f-bc24-17832651a73c	109	1	31aa201c-b62d-4551-a790-5b26984b56da	COURSE
524957af-c590-4a2d-90e6-8bc7ac4523c5	cd92c51c-f23d-4c2f-bc24-17832651a73c	123	1	267e3872-185c-45f3-9f80-b3c45428c2d5	COURSE
b70400dd-7feb-4984-a6a1-1075c0ffee1f	cd92c51c-f23d-4c2f-bc24-17832651a73c	176	1	4b01a040-fa39-49d4-9856-d24bf83cc582	EBOOK
e00d1aee-a12d-4783-b62f-7090eaee0966	a40366d5-736b-4521-9392-dcf2d62b1f8f	197	1	9c98f692-4508-4bf3-aee2-ad5f4327c5fb	WORKSHOP
93206b5b-c556-46c0-82be-26bbd9b2eb5b	a40366d5-736b-4521-9392-dcf2d62b1f8f	214	1	8ce0263a-dbfe-45ad-b2bd-38ab3de52bf7	WORKSHOP
b0b4a43d-7363-4e99-9161-6c8ca96f46fc	9e1e342c-f7a8-493d-b659-3244ab64f702	151	1	651364e4-c07a-48bc-a0fb-a65995440f1f	WORKSHOP
ed755003-2ceb-44c8-b5ca-452020bdd04a	9e1e342c-f7a8-493d-b659-3244ab64f702	132	1	44df3d72-5969-496f-8d83-b9d2c4daba0c	EBOOK
0e263ee7-f0b9-4388-a8cb-07bb13fd5771	80eccc4c-65b0-41e5-8793-ad736b7fb7e0	239	1	b00f8f66-e4ae-4a15-8e97-14304e63de8b	EBOOK
621ce967-7707-4c41-9006-0875832f537a	80eccc4c-65b0-41e5-8793-ad736b7fb7e0	56	1	75e5ff03-3221-48bf-a235-c3fdfbfb9e63	WORKSHOP
4ab76355-d46d-49fc-9790-1ef8fc1b282b	80eccc4c-65b0-41e5-8793-ad736b7fb7e0	148	1	3b7455a4-444d-4acb-b671-0f729dae1866	EBOOK
3e57da47-1247-4421-84d3-a8b8148b96a1	ab84f305-fabc-4b09-8090-ca0b0e803655	188	1	9ab59d15-c997-4eb2-9b99-d97abc757a2c	COURSE
d1ceb944-153d-490c-8b72-cc7ba7e77e30	ab84f305-fabc-4b09-8090-ca0b0e803655	72	1	ec1bbade-052d-4eb5-9122-ce4e0887980b	COURSE
359ab5b0-80c9-406b-b66e-4ca13eb04f6a	4fc3e07f-49cf-45eb-a476-0a5b3f9afc2c	111	1	fc094d80-0043-4e7a-9b22-49dca1c423e7	EBOOK
6a2a2733-14e5-4fd6-9f89-0277e43c56d0	4fc3e07f-49cf-45eb-a476-0a5b3f9afc2c	186	1	27ad83b6-19fc-4227-9645-b96cf963ef1c	WORKSHOP
2621d871-4744-484c-acda-fd064fffc750	4fc3e07f-49cf-45eb-a476-0a5b3f9afc2c	65	1	ea8e4903-3b1d-4d22-9b3c-52fe4079a2ed	COURSE
c707e15a-a1db-4145-b602-a875af283c44	06303a93-6300-4dca-bda5-9b909082796e	219	1	16626c63-b598-4ca7-bbcb-b7fa3a435941	WORKSHOP
d918e1cd-fb55-4ed9-a686-68525a0c3d53	23c15ad9-1171-4eb3-869b-d55f63f3cc1a	66	1	1b1fc904-fc5d-4fa9-a284-da2ec91f17e1	EBOOK
640dce3f-7736-4c7f-b1b1-99197be3a3f7	23c15ad9-1171-4eb3-869b-d55f63f3cc1a	157	1	b8107161-16fc-46ea-9a7f-daade52c0217	COURSE
b1225bc4-240a-4105-9343-caff5138f3cd	23c15ad9-1171-4eb3-869b-d55f63f3cc1a	225	1	2254b722-fc41-4d0e-84c3-174f4075f2c3	WORKSHOP
8eb6581f-65b9-441b-9ef8-f90124637245	5021f89c-cc0f-45b2-9177-4496fc88bda1	170	1	bd6ec78d-32fd-4482-bec4-d271f9d3b81c	COURSE
d498e46e-7522-45ba-ae8b-1518e337ca5f	5021f89c-cc0f-45b2-9177-4496fc88bda1	220	1	437226aa-7d4e-40dc-8d90-9db07ce739d9	EBOOK
92888093-f5bd-4dcc-8623-46f4cc1e5094	a6889659-3a02-4d9c-859d-911840d24266	83	1	e6c18ebc-e746-41d0-a00c-6e3a4925b491	EBOOK
41b039cf-baa2-4c66-adc7-42a4340569f3	a6889659-3a02-4d9c-859d-911840d24266	116	1	7432d681-667b-43e2-854e-208adbd2dae7	WORKSHOP
3676c9f2-b557-4bb5-b69d-f4da05847bb6	ff198f1c-08b2-4366-84ab-019c283c2ca3	172	1	d519159e-5cd3-45d3-94a8-5acf069d28f8	COURSE
7609fdf7-988c-4e76-8b71-88691c173de6	09233810-705d-4393-bdf2-f92bfcbfe2f5	158	1	24d7d7ed-21e7-44e0-a40e-7586652e3cd8	EBOOK
7875c684-8c22-4b13-b561-1435bac12d28	09233810-705d-4393-bdf2-f92bfcbfe2f5	194	1	5f7d57a9-d3d9-4f31-adfb-dad87ce4b2a9	COURSE
a7d7a454-8e4b-4f54-aa5b-758b91cd7e69	09233810-705d-4393-bdf2-f92bfcbfe2f5	243	1	f59ce114-27f5-45a5-8f67-df1a517476d9	COURSE
684cc0a3-e5e5-4dff-aa16-edb641d53948	538ab025-434e-4eef-b5d7-70f00f37aaad	101	1	2d086a5c-116c-47a9-b58a-2999146e5828	COURSE
7010bac6-80db-4279-a604-f423ebcb34da	538ab025-434e-4eef-b5d7-70f00f37aaad	75	1	16b6a8c9-ab4f-4b7a-ae1b-352f540688da	WORKSHOP
30efbd0d-997f-4c0c-92b3-6d8835aeb60e	538ab025-434e-4eef-b5d7-70f00f37aaad	197	1	4bbd7c8a-8a34-468f-a345-ad9aa22e5987	EBOOK
1d852c02-a8e0-4f9d-9c33-555ae4b11968	09e7c416-4d7b-48ed-bbbf-77c4ecbdb3c8	50	1	b6a768d3-66ab-48df-9947-fb123f099be5	EBOOK
e7ad8424-a40c-4a51-b828-6a8c1a212aa2	82d68fe7-3ed2-46e3-8de9-225ef3e08b7d	154	1	d6d021ef-ef2d-447b-83f4-d66c834b75a4	EBOOK
0f33ec24-48eb-4cbf-bb55-dc31979f690a	82d68fe7-3ed2-46e3-8de9-225ef3e08b7d	117	1	ee5d2737-d5d3-42d5-9170-00a1918f1e40	EBOOK
b24c6b11-13ec-4688-ae4a-c1dbe1f7d9cf	5963d0bb-fd88-4200-afbf-78456cdf3d93	243	1	97677815-fcaa-49c9-b67f-a4000741bea7	COURSE
62ff56ac-3810-4750-ba40-a2a2b974ee32	5963d0bb-fd88-4200-afbf-78456cdf3d93	237	1	fcf3910b-182c-4583-a5ac-71d50986cfcc	EBOOK
17237a17-e93f-481d-9ad4-e70c1a338f49	44874e83-9caa-42b4-9fd8-f183a8acce90	186	1	b9509c2a-0d0d-4f43-8f72-04f0f89be102	WORKSHOP
53fdc430-8d55-473f-a636-6d5977b6f14b	44874e83-9caa-42b4-9fd8-f183a8acce90	129	1	1d901c6d-ba09-4e5b-b588-9df60300988d	COURSE
a45abb1c-2e0a-498e-8861-c587e1455fde	b1f6ee34-403c-4e35-a8a3-b3f3c7f8a1cf	224	1	679f3dfd-381a-4077-83d8-6e1e13eb86bf	EBOOK
0bbe69a3-e15f-439a-ac92-02d32cae53a8	b1f6ee34-403c-4e35-a8a3-b3f3c7f8a1cf	223	1	815a133e-f0d6-4334-b1eb-6c8f71a911ae	EBOOK
13d4302e-01f7-4761-86b3-73cf268259bf	0074698e-ef8b-4941-be26-fcefa49e9086	204	1	e73ea4aa-7fa8-4ed3-8c38-4ee7bd3fa30a	COURSE
aca51843-8ea9-4bae-a6de-e2bdf46353f7	0074698e-ef8b-4941-be26-fcefa49e9086	176	1	6e736ada-78b6-41e1-ae97-95525780e4ac	COURSE
c9710436-9bc6-4cfb-a1f0-cf90e7aba45f	0074698e-ef8b-4941-be26-fcefa49e9086	149	1	b262eece-3cb4-4f6e-859a-ff8e359eba4b	WORKSHOP
31fcbcfe-09b3-4489-864b-82f092dcbe07	5c363a5f-18ca-4642-a7ce-edb4914613f0	61	1	ea60a11b-b0c1-473d-9b86-a0f7a83c0a02	EBOOK
5dc3a658-d267-44d8-b85c-d8d7f4f9c4c2	5c363a5f-18ca-4642-a7ce-edb4914613f0	218	1	122958b8-406b-4279-aaf4-8036d643d3c9	EBOOK
dc9f95a2-84a7-49bd-ae47-817ec5dbb7dd	3a9b661f-cdcb-4b91-9eca-cee86b3ddc25	234	1	5743aec4-7f8a-4197-8b20-7f0c029b8b7a	WORKSHOP
274a3e60-10a4-4752-b790-c9c80da07dba	c20effa2-2a72-4d0f-bb44-da77481131d0	235	1	4f969351-166d-4d70-b919-1de5a0350e8e	WORKSHOP
8c14cdcd-93d0-4661-a60e-25b023bd3923	c20effa2-2a72-4d0f-bb44-da77481131d0	90	1	7e392110-6384-47a9-ad71-a5e02b949f37	COURSE
c89f3bc6-6495-454d-ae61-82fbcc2ee4c5	c20effa2-2a72-4d0f-bb44-da77481131d0	214	1	d544d130-7eec-44fe-8007-4f01dbcbd4bd	COURSE
7115193b-b745-4820-aef3-70474284b84e	5d501754-a154-4dd9-87f1-93864cced31c	137	1	b94e54e4-9193-4981-ba18-861e4e518bea	EBOOK
a0fd1458-7233-42fd-a5d5-33b496c3ea44	5d501754-a154-4dd9-87f1-93864cced31c	133	1	02f624db-f255-42c0-8f44-006e133758de	EBOOK
cc0621ed-d3f3-4a53-894f-a71c77dc2e87	4d3f9f22-3295-459d-bf5a-03a9a0d401e9	124	1	fa7a8b0b-bf2c-45f7-9cfb-1edf42f566b6	COURSE
3554e33b-885b-4228-8cb5-910dadeae47c	c790b1bb-678d-4e56-b4d3-366fb3b74773	154	1	1837c353-d1b8-429c-b556-c4d1a1eea302	EBOOK
30a0bfd6-6641-4f54-b84a-b9223956a5b9	c790b1bb-678d-4e56-b4d3-366fb3b74773	65	1	bfa032c9-0c78-42f6-bbbe-4c82960a3977	COURSE
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."Review" ("id", "userId", "courseId", "rating", "content", "createdAt", "updatedAt") FROM stdin;
1021daec-248c-40f1-a7ad-f737a81ff681	02ecf50b-174b-48ec-8988-d8d77a1a02c1	59694697-fe29-4cdb-9627-628d94302814	5	이력서 작성에 정말 큰 도움이 되었습니다. 특히 ATS 관련 팁은 어디서도 듣지 못한 내용이었어요!	2025-12-06 14:04:17.669	2026-01-16 04:26:27.215
d63b0754-6557-4a72-abf0-9f22d8a7179b	0560a743-6d75-4fe9-bf64-018aac286738	59694697-fe29-4cdb-9627-628d94302814	4.5	면접 준비가 막막했는데, 이 강의 덕분에 자신감을 얻었습니다. 모의 면접 질문들이 실제와 매우 비슷했습니다.	2026-01-15 02:49:33.126	2026-01-16 04:26:27.37
c3ff0af4-2288-4446-be7e-1408275f1abb	0b2553ef-638c-47af-ae1d-ccb7501e6ce3	59694697-fe29-4cdb-9627-628d94302814	5	강사님의 경험에서 우러나오는 조언들이 인상 깊었습니다. 해외 취업을 준비하는 분들께 강력 추천합니다.	2025-12-26 14:11:16.714	2026-01-16 04:26:27.533
998a018a-08b8-4036-9122-bb9b8cd2b7ae	02ecf50b-174b-48ec-8988-d8d77a1a02c1	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	5	이력서 작성에 정말 큰 도움이 되었습니다. 특히 ATS 관련 팁은 어디서도 듣지 못한 내용이었어요!	2025-12-22 03:25:26.519	2026-01-16 04:26:27.692
1958e435-586c-4827-991a-c4153959ae1e	0560a743-6d75-4fe9-bf64-018aac286738	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	4.5	면접 준비가 막막했는데, 이 강의 덕분에 자신감을 얻었습니다. 모의 면접 질문들이 실제와 매우 비슷했습니다.	2026-01-02 10:21:47.482	2026-01-16 04:26:27.859
287a4c58-e32d-4722-b834-135b15d4c640	0b2553ef-638c-47af-ae1d-ccb7501e6ce3	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	5	강사님의 경험에서 우러나오는 조언들이 인상 깊었습니다. 해외 취업을 준비하는 분들께 강력 추천합니다.	2025-11-25 11:07:54.754	2026-01-16 04:26:28.015
6bea7617-1fcc-4ae6-bf25-30e518b8aa98	02ecf50b-174b-48ec-8988-d8d77a1a02c1	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	5	이력서 작성에 정말 큰 도움이 되었습니다. 특히 ATS 관련 팁은 어디서도 듣지 못한 내용이었어요!	2025-10-21 15:31:50.49	2026-01-16 04:26:28.171
46fdec01-d014-403b-b3d9-a43d8897eecb	0560a743-6d75-4fe9-bf64-018aac286738	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	4.5	면접 준비가 막막했는데, 이 강의 덕분에 자신감을 얻었습니다. 모의 면접 질문들이 실제와 매우 비슷했습니다.	2025-11-06 08:55:42.623	2026-01-16 04:26:28.319
878146b5-dbd7-4987-b2c4-dc148273f3e7	0b2553ef-638c-47af-ae1d-ccb7501e6ce3	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	5	강사님의 경험에서 우러나오는 조언들이 인상 깊었습니다. 해외 취업을 준비하는 분들께 강력 추천합니다.	2025-12-15 05:45:10.291	2026-01-16 04:26:28.502
e4d8b19c-72cd-431d-be7e-1b2dcb57bb18	02ecf50b-174b-48ec-8988-d8d77a1a02c1	1042ae1e-aa2b-470e-a2f1-1da830e244f8	5	이력서 작성에 정말 큰 도움이 되었습니다. 특히 ATS 관련 팁은 어디서도 듣지 못한 내용이었어요!	2025-12-22 01:57:57.733	2026-01-16 04:26:28.657
5cfb3c1c-386e-4151-8ba7-e9908224e296	0560a743-6d75-4fe9-bf64-018aac286738	1042ae1e-aa2b-470e-a2f1-1da830e244f8	4.5	면접 준비가 막막했는데, 이 강의 덕분에 자신감을 얻었습니다. 모의 면접 질문들이 실제와 매우 비슷했습니다.	2026-01-13 15:50:58.43	2026-01-16 04:26:28.81
07215c64-f79d-4e4f-99f1-718006442857	0b2553ef-638c-47af-ae1d-ccb7501e6ce3	1042ae1e-aa2b-470e-a2f1-1da830e244f8	5	강사님의 경험에서 우러나오는 조언들이 인상 깊었습니다. 해외 취업을 준비하는 분들께 강력 추천합니다.	2025-10-19 02:14:41.433	2026-01-16 04:26:28.958
b2b5d2a5-80ba-431d-9f9d-63de3c3ecdfe	02ecf50b-174b-48ec-8988-d8d77a1a02c1	551cdb89-263c-4c23-85a7-8b53bb1d2c82	5	이력서 작성에 정말 큰 도움이 되었습니다. 특히 ATS 관련 팁은 어디서도 듣지 못한 내용이었어요!	2025-12-21 14:07:02.8	2026-01-16 04:26:29.116
2da96389-1509-48f8-9184-08e31f31198a	0560a743-6d75-4fe9-bf64-018aac286738	551cdb89-263c-4c23-85a7-8b53bb1d2c82	4.5	면접 준비가 막막했는데, 이 강의 덕분에 자신감을 얻었습니다. 모의 면접 질문들이 실제와 매우 비슷했습니다.	2025-12-10 12:10:30.939	2026-01-16 04:26:29.27
02e13926-7d6c-405f-9403-fa261a102c5a	0b2553ef-638c-47af-ae1d-ccb7501e6ce3	551cdb89-263c-4c23-85a7-8b53bb1d2c82	5	강사님의 경험에서 우러나오는 조언들이 인상 깊었습니다. 해외 취업을 준비하는 분들께 강력 추천합니다.	2025-11-07 18:33:13.033	2026-01-16 04:26:29.446
07683c58-e14b-4949-8262-034d697169cb	02ecf50b-174b-48ec-8988-d8d77a1a02c1	2392d3ea-e47c-4854-bb16-c8a39ff114dc	5	이력서 작성에 정말 큰 도움이 되었습니다. 특히 ATS 관련 팁은 어디서도 듣지 못한 내용이었어요!	2025-11-23 04:52:56.231	2026-01-16 04:26:29.633
27dca414-bcfc-4e7e-83e6-8678356a903d	0560a743-6d75-4fe9-bf64-018aac286738	2392d3ea-e47c-4854-bb16-c8a39ff114dc	4.5	면접 준비가 막막했는데, 이 강의 덕분에 자신감을 얻었습니다. 모의 면접 질문들이 실제와 매우 비슷했습니다.	2025-11-19 21:42:36.058	2026-01-16 04:26:29.804
37e3ed0a-5734-4366-96ca-75a38e5b4b85	0b2553ef-638c-47af-ae1d-ccb7501e6ce3	2392d3ea-e47c-4854-bb16-c8a39ff114dc	5	강사님의 경험에서 우러나오는 조언들이 인상 깊었습니다. 해외 취업을 준비하는 분들께 강력 추천합니다.	2026-01-15 04:46:10.523	2026-01-16 04:26:29.998
\.


--
-- Data for Name: Section; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."Section" ("courseId", "title", "description", "orderIndex", "createdAt", "updatedAt", "id") FROM stdin;
59694697-fe29-4cdb-9627-628d94302814	북미 개발자 채용 공고 사례	\N	1	2026-01-16 04:25:36.74	2026-01-16 04:25:36.74	13d969b8-da77-44c5-b0c0-737c832dbb1b
59694697-fe29-4cdb-9627-628d94302814	북미 개발자 채용 공고 분석	\N	2	2026-01-16 04:25:36.74	2026-01-16 04:25:36.74	9a4fe199-994b-407b-8fba-201ba10b37e3
59694697-fe29-4cdb-9627-628d94302814	실제 북미 개발자 취업 성공 이력서	\N	3	2026-01-16 04:25:36.74	2026-01-16 04:25:36.74	fb875e23-8d5b-495a-8554-6f287f718df9
87f6741e-4ef1-481d-bc9b-3d9fe73607cb	북미 개발자 채용 공고 사례	\N	1	2026-01-16 04:25:39.607	2026-01-16 04:25:39.607	c224e413-9523-44a2-ac23-ec0a7a524d57
87f6741e-4ef1-481d-bc9b-3d9fe73607cb	북미 개발자 채용 공고 분석	\N	2	2026-01-16 04:25:39.607	2026-01-16 04:25:39.607	c8781d3f-9c71-449c-b711-7703bc6e6cdf
87f6741e-4ef1-481d-bc9b-3d9fe73607cb	실제 북미 개발자 취업 성공 이력서	\N	3	2026-01-16 04:25:39.607	2026-01-16 04:25:39.607	a985789a-894a-42ce-a8cc-1330cb4e2b3d
51c1a6e8-5641-46fd-ae62-10d1a43c0c22	북미 개발자 채용 공고 사례	\N	1	2026-01-16 04:25:42.315	2026-01-16 04:25:42.315	8b05d115-e2e5-4314-914b-aeb34585c221
51c1a6e8-5641-46fd-ae62-10d1a43c0c22	북미 개발자 채용 공고 분석	\N	2	2026-01-16 04:25:42.315	2026-01-16 04:25:42.315	ded7ad48-a8e2-4624-aea0-f31570c9741b
51c1a6e8-5641-46fd-ae62-10d1a43c0c22	실제 북미 개발자 취업 성공 이력서	\N	3	2026-01-16 04:25:42.315	2026-01-16 04:25:42.315	77ba50f7-f88d-45ba-8cf6-3086f7b3aa7b
1042ae1e-aa2b-470e-a2f1-1da830e244f8	북미 개발자 채용 공고 사례	\N	1	2026-01-16 04:25:45.08	2026-01-16 04:25:45.08	a8f5096b-2136-48bf-957f-cd3d07bf056e
1042ae1e-aa2b-470e-a2f1-1da830e244f8	북미 개발자 채용 공고 분석	\N	2	2026-01-16 04:25:45.08	2026-01-16 04:25:45.08	5c3a9d95-0796-4fce-a958-6b90014185df
1042ae1e-aa2b-470e-a2f1-1da830e244f8	실제 북미 개발자 취업 성공 이력서	\N	3	2026-01-16 04:25:45.08	2026-01-16 04:25:45.08	3a8dffa6-753c-4a0a-b55d-2d730743a23d
551cdb89-263c-4c23-85a7-8b53bb1d2c82	북미 개발자 채용 공고 사례	\N	1	2026-01-16 04:25:47.841	2026-01-16 04:25:47.841	1f23ee16-52b4-4cb2-b15d-141895be786d
551cdb89-263c-4c23-85a7-8b53bb1d2c82	북미 개발자 채용 공고 분석	\N	2	2026-01-16 04:25:47.841	2026-01-16 04:25:47.841	eadd0efb-9544-4343-903d-d4046c13ce42
551cdb89-263c-4c23-85a7-8b53bb1d2c82	실제 북미 개발자 취업 성공 이력서	\N	3	2026-01-16 04:25:47.841	2026-01-16 04:25:47.841	9b6bbca6-e71a-4a61-8387-e42dd3323725
2392d3ea-e47c-4854-bb16-c8a39ff114dc	북미 개발자 채용 공고 사례	\N	1	2026-01-16 04:25:50.723	2026-01-16 04:25:50.723	38a5533c-6d81-4b49-843e-b3e58111f9be
2392d3ea-e47c-4854-bb16-c8a39ff114dc	북미 개발자 채용 공고 분석	\N	2	2026-01-16 04:25:50.723	2026-01-16 04:25:50.723	92d1c352-f0b0-4020-b178-94ddfa60b262
2392d3ea-e47c-4854-bb16-c8a39ff114dc	실제 북미 개발자 취업 성공 이력서	\N	3	2026-01-16 04:25:50.723	2026-01-16 04:25:50.723	ccb84ef5-69d4-4c50-be2b-e39f50416d56
41821778-d487-4442-83f5-cb4fb0173df1	test	test	0	2026-04-23 17:29:22.694	2026-04-23 17:29:22.694	855b4ab7-aaf4-4354-8dbd-46f3e3ec8f10
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."User" ("id", "email", "name", "image", "createdAt", "updatedAt", "isSubscribed", "subscriptionEndDate", "lastLoginAt", "clerkId", "roleId", "interest", "nickname") FROM stdin;
02ecf50b-174b-48ec-8988-d8d77a1a02c1	seulgi568+test008@gmail.com	슬기 이	\N	2025-10-20 22:20:36.049	2025-10-20 22:20:36.049	f	\N	\N	user_34LhboTs9I5E0OwE6vc6RId7KJ1	USER	\N	\N
0560a743-6d75-4fe9-bf64-018aac286738	mirimkim00+test11@gmail.com	miirim kim	\N	2025-10-30 21:04:51.173	2025-10-30 21:04:51.173	f	\N	\N	user_34nndCcvGwPTtD9rmu1QrIJlPRu	USER	\N	\N
0b2553ef-638c-47af-ae1d-ccb7501e6ce3	seulgi568+test010@gmail.com	슬기 이	\N	2025-07-14 20:25:52.544	2025-07-14 20:25:52.544	f	\N	\N	user_2zsfYjyDtGDaMswp42a1QBRCVWV	USER	\N	\N
122f2690-e1b1-42e5-95f8-26608671b02b	seulgi568@gmail.com	이슬기	\N	2025-05-09 00:55:33.695	2025-05-30 00:43:16.578	f	\N	\N	user_2wptvqGpIIuiY3g7M7yyYFyxOj7	ADMIN	\N	\N
1fc7e5db-6ba2-481a-b311-355f12c6b4d1	seulgi568+test007@gmail.com	\N	\N	2025-06-27 00:21:40.113	2025-06-27 00:21:40.113	f	\N	\N	user_2z4I0nEcxg2PGODqJfqFw5is5hK	USER	\N	\N
2010a767-2ea4-4c0f-a092-5c366ccbd9ac	example@example.org	Example Example	\N	2025-02-12 02:32:33.661	2025-05-12 14:16:10.485	f	\N	\N	user_29w83sxmDNGwOuEthce5gg56FcC	USER	\N	\N
4c02fdfa-987d-423d-8d7f-18e96b5604ed	tmfrl568@naver.com	\N	\N	2025-06-19 23:32:20.969	2025-06-19 23:32:20.969	f	\N	\N	user_2ykQ9JAHTy6yd7dIRHcrmnoIqaz	USER	\N	\N
5e4bcb8a-2d16-45e4-81ea-697c7d3e551b	sehwanhistory+test2@gmail.com	\N	\N	2025-05-26 23:58:04.983	2025-05-26 23:58:04.983	f	\N	\N	user_2xegJn3zYUqZFhLeMbJWOgFoWZk	USER	\N	\N
653ab0e2-cc24-4cfb-b045-afd30f4d53af	sehwanhistory@gmail.com	Haan	\N	2025-05-12 14:26:27.347	2025-05-12 14:26:27.347	f	\N	\N	user_2x014UwPtrq3DlHo1foFiJ6pHAt	ADMIN	\N	\N
6e637d86-bda4-4b15-8e62-af4db130d267	lllljh1009+test55@gmail.com	jihyun lee	\N	2025-07-22 00:30:53.795	2025-07-22 00:30:53.795	f	\N	\N	user_30CvDnX1E15IT7VfqqdOqAblHcz	USER	\N	\N
76ff2faa-0c54-4909-8593-db5cf914ce44	seulgi568+test001@gmail.com	\N	\N	2025-06-23 23:11:56.158	2025-06-23 23:11:56.158	f	\N	\N	user_2yvgA1LXhGCAmuPdO6OPQWzLDxy	USER	\N	\N
77fd445a-0f8e-4875-9805-534a895b784c	seulgi568+test004@gmail.com	\N	\N	2025-06-24 23:01:43.559	2025-06-24 23:01:43.559	f	\N	\N	user_2yyU2pExfMlmkpeiRqWkCFqDb3N	USER	\N	\N
81cb60a3-14fc-4d14-bdf6-f1be9d3f7b4a	seulgi568+test003@gmail.com	\N	\N	2025-06-23 23:30:51.38	2025-06-23 23:30:51.38	f	\N	\N	user_2yviSb22dRknCi6LD9GdVsVeNSx	USER	\N	\N
8d9d2af7-3340-4c0b-bfc4-bbecd00b8e1d	mirimkim00+test3@gmail.com	\N	\N	2025-02-14 15:15:10.986	2025-03-06 04:22:04.201	f	\N	\N	user_2t2NFifLPjbebK9fBuXDFrx5Red	USER	\N	\N
8ff2c4e4-ceaf-4bc4-a0ac-7f501bdc0f1d	seulgi568+test009@gmail.com	슬기 이	\N	2025-10-20 22:28:43.917	2025-10-20 22:28:43.917	f	\N	\N	user_34Lib9xuxu9sdpvzGflIrg3Ev9N	USER	\N	\N
901f4dc2-d843-4432-9a0b-d4e3da95ce8e	lllljh1009+test50@gmail.com	\N	\N	2025-07-06 14:22:54.457	2025-07-06 14:22:54.457	f	\N	\N	user_2zVMQdirWOcwIeVWLTkvX5ZxvEL	USER	\N	\N
942023a4-14e8-43ea-88a4-b2b32b449aa2	owenseok0201@gmail.com	호인 석	\N	2025-06-23 22:22:27.492	2025-07-31 23:59:10.88	f	\N	\N	user_2yva8z6AaCqoGamHTyboYIuFCR5	USER	\N	\N
a6878194-5472-473b-a480-47d5da837aae	dlwlgus19@gmail.com	지현 이	\N	2025-08-05 22:48:21.745	2025-08-05 22:48:21.745	f	\N	\N	user_30t5bIsAxJkxEOmAJnGOBiE8cyp	USER	\N	\N
a93e9ea6-085f-4697-bc1c-c70e6718f631	mirimkim00+test2@gmail.com	\N	\N	2025-02-14 05:34:01.071	2025-02-14 05:34:01.071	f	\N	\N	user_2t1EZnP5HSencNqcy0lSCIW21zc	USER	\N	\N
aca7cf0e-ce41-4ece-a9b7-a303d3bb481d	slee588@myseneca.ca	\N	\N	2025-06-23 22:09:55.498	2025-06-23 22:09:55.498	f	\N	\N	user_2yvYcSzJq58Sk9VzQ4NU8AXUBFE	USER	\N	\N
b0c5697d-0987-4e66-aaa1-ee395aeb734f	plplplplpl35@gmail.com	\N	\N	2025-06-23 22:38:36.655	2025-06-23 22:38:36.655	f	\N	\N	user_2yvc6n3FNwT7lcsDqGglp3NL5UZ	USER	\N	\N
b94b1968-cd6a-4e66-a7ba-3d6c49c33571	mirimkim00+test01@gmail.com	m k	\N	2025-10-30 22:33:55.161	2025-10-30 22:33:55.161	f	\N	\N	user_34nySlutCEGNwV6fs5lhEQxC7ei	USER	\N	\N
ba54b0f6-9059-400b-b333-c6b9b3024a5a	mirimkim00+test@gmail.com	mirim km	\N	2025-10-30 19:35:58.525	2025-10-30 19:35:58.525	f	\N	\N	user_34ncp8XAR54jJfvdaT8dUwtIQTW	USER	\N	\N
bbaa62b4-e3de-4347-985f-39ca54ad3fdb	mirimkim00+test1@gmail.com	\N	\N	2025-02-14 04:40:37.041	2025-11-06 21:55:02.218	f	\N	\N	user_2t184yQfoUojwDATpXW8NkwnSi1	ADMIN	\N	\N
bc299297-9ab7-434a-9741-693f2e413826	seulgi568+test006@gmail.com	\N	\N	2025-06-25 00:20:39.459	2025-06-25 00:20:39.459	f	\N	\N	user_2yyddlksHja2UYK4a51thPb1QVB	USER	\N	\N
bd94c312-eeeb-4164-9e44-9ea1ecec735e	lllljh1009+test30@gmail.com	이지현	\N	2025-06-06 22:51:39.701	2025-06-06 23:06:03.295	f	\N	\N	user_2y9cavjahnCslWbnys0cRV1Gq8X	ADMIN	\N	\N
ca736a82-7c9f-43eb-be4b-2568d7030a43	seulgi568+test002@gmail.com	\N	\N	2025-06-23 23:17:32.72	2025-06-23 23:17:32.72	f	\N	\N	user_2yvgqLrrWGeTwhvmKCf1hS7n8d1	USER	\N	\N
cb617c34-f2c0-4658-ade0-a0a42ccb92d8	mirimkim00+test4@gmail.com	\N	\N	2025-05-12 17:20:35.614	2025-05-12 17:20:35.614	f	\N	\N	user_2x0MFdWRmZwtEtZYKqkKtejA8pB	USER	\N	\N
049433d8-fe60-437b-bd56-e347874dcbcc	josephsong@upluseducation.ca	jw song	\N	2025-12-29 04:56:28.656	2025-12-29 04:56:28.656	f	\N	\N	user_37VNGoNyMOBNLSdASJWpaVcF6el	ADMIN	\N	\N
6310797c-f477-4200-8148-b96daef7cc44	seulgi568+test20260115@gmail.com	슬기 이	\N	2026-01-15 23:35:02.603	2026-01-15 23:35:02.603	f	\N	\N	user_38JaPAlANgsgUkGVdWCDZrSEUFE	USER	\N	\N
3d2a2f42-ab39-4b3c-b59e-448c841185ef	seulgi568+test2026011501@gmail.com	슬기 이	\N	2026-01-16 02:01:42.545	2026-01-16 02:01:42.545	f	\N	\N	user_38JsF1bMVM0JRRzjZYLF3rxEXNG	USER	\N	\N
76961d93-0f30-4089-a3e8-310ecf027d03	user2@example.com	User 2	\N	2025-11-19 03:56:20.771	2026-01-16 04:25:55.776	f	\N	2026-01-16 03:33:03.352	clerk_user_2	USER	\N	Nick2
e6295ea8-f0d1-4eaf-bc8f-4c0f1ab0bee2	user3@example.com	User 3	\N	2025-10-25 18:50:59.829	2026-01-16 04:25:57.442	t	\N	2026-01-16 03:33:04.464	clerk_user_3	USER	\N	Nick3
4d3be620-e511-4960-b1d0-dabe564182dc	user4@example.com	User 4	\N	2025-09-29 01:47:15.351	2026-01-16 04:25:58.01	f	\N	2026-01-16 03:33:05.318	clerk_user_4	ADMIN	\N	Nick4
df973246-b40f-4357-8de1-d98df77264fe	user5@example.com	User 5	\N	2025-10-12 17:41:46.936	2026-01-16 04:25:59.142	f	\N	2026-01-16 03:33:05.586	clerk_user_5	INSTRUCTOR	\N	Nick5
e980f584-be8c-4144-a0cf-944fac60a4f8	user6@example.com	User 6	\N	2025-12-07 18:56:48.493	2026-01-16 04:26:00.218	t	\N	2026-01-16 03:33:06.432	clerk_user_6	USER	\N	Nick6
4c19d334-8d3e-4b45-b57e-8b247a451af2	user7@example.com	User 7	\N	2025-12-24 07:24:33.249	2026-01-16 04:26:01.302	f	\N	2026-01-16 03:33:07.273	clerk_user_7	USER	\N	Nick7
934c7f39-2b18-4115-9106-94e2ca01aa0a	user8@example.com	User 8	\N	2025-10-28 11:12:47.864	2026-01-16 04:26:02.401	f	\N	2026-01-16 03:33:08.762	clerk_user_8	USER	\N	Nick8
7dee36c2-96d7-407e-810c-dc72630b4a82	user9@example.com	User 9	\N	2025-12-19 05:16:02.673	2026-01-16 04:26:02.969	t	\N	2026-01-16 03:33:10.155	clerk_user_9	USER	\N	Nick9
e3fda2b2-39fd-424e-8df1-40bb1d2d0d8c	user10@example.com	User 10	\N	2026-01-08 08:37:49.677	2026-01-16 04:26:04.686	f	\N	2026-01-16 03:33:10.712	clerk_user_10	ADMIN	\N	Nick10
4206e45f-1a69-4bbd-874d-25774af9282b	user11@example.com	User 11	\N	2026-01-11 10:33:05.707	2026-01-16 04:26:06.174	f	\N	2026-01-16 03:33:10.988	clerk_user_11	INSTRUCTOR	\N	Nick11
30b53927-60fd-44e4-a14d-c7b5a56c06cc	user12@example.com	User 12	\N	2025-11-16 22:29:26.606	2026-01-16 04:26:07.865	t	\N	2026-01-16 03:33:12.391	clerk_user_12	USER	\N	Nick12
1a33220e-b2a6-4bdc-b7fa-b3c01adb259c	user13@example.com	User 13	\N	2025-12-14 04:30:17.753	2026-01-16 04:26:08.475	f	\N	2026-01-16 03:33:13.735	clerk_user_13	USER	\N	Nick13
41600165-6b41-4d64-ac92-a9c2d223f40d	user14@example.com	User 14	\N	2025-10-01 21:29:59.775	2026-01-16 04:26:09.009	f	\N	2026-01-16 03:33:14.629	clerk_user_14	USER	\N	Nick14
dcbb7f9a-0bdd-4851-8432-4e6e4a8ebf10	user15@example.com	User 15	\N	2025-10-26 05:05:39.776	2026-01-16 04:26:09.288	t	\N	2026-01-16 03:33:16.32	clerk_user_15	USER	\N	Nick15
7ab89e45-7d56-47ee-8afd-e1c438f811f1	user16@example.com	User 16	\N	2025-11-21 14:23:07.533	2026-01-16 04:26:10.7	f	\N	2026-01-16 03:33:18.134	clerk_user_16	USER	\N	Nick16
f859502f-c6bc-4a51-82f1-8cf5459e1e83	user17@example.com	User 17	\N	2025-12-02 23:13:34.821	2026-01-16 04:26:11.252	f	\N	2026-01-16 03:33:19.617	clerk_user_17	INSTRUCTOR	\N	Nick17
a879858c-2c8e-4d79-999c-4a90b97ad000	user18@example.com	User 18	\N	2025-11-16 05:51:17.827	2026-01-16 04:26:11.532	t	\N	2026-01-16 03:33:20.272	clerk_user_18	USER	\N	Nick18
73055616-4289-47ff-b647-0746db2b9164	user19@example.com	User 19	\N	2025-11-17 19:04:21.047	2026-01-16 04:26:12.388	f	\N	2026-01-16 03:33:21.38	clerk_user_19	USER	\N	Nick19
16c8944f-6677-4108-95f8-0ac517b06765	user20@example.com	User 20	\N	2025-09-22 20:09:09.037	2026-01-16 04:26:13.313	f	\N	2026-01-16 03:33:23.068	clerk_user_20	USER	\N	Nick20
dc9764fa-cf71-4a63-bb65-21445bd6542a	user21@example.com	User 21	\N	2025-10-28 07:21:37.288	2026-01-16 04:26:14.679	t	\N	2026-01-16 03:33:23.737	clerk_user_21	INSTRUCTOR	\N	Nick21
4a2e81fa-875a-4597-bef4-2774ba17aaec	user22@example.com	User 22	\N	2025-11-04 10:07:12.388	2026-01-16 04:26:16.077	f	\N	2026-01-16 03:33:24.622	clerk_user_22	INSTRUCTOR	\N	Nick22
9b5ab529-b153-49d5-93ef-0b8d70f2a0a0	user24@example.com	User 24	\N	2025-10-12 05:54:18.827	2026-01-16 04:26:19.157	t	\N	2026-01-16 03:33:26.064	clerk_user_24	ADMIN	\N	Nick24
dbb61217-2d8f-4c33-9888-11dda6ced1a7	user25@example.com	User 25	\N	2025-12-27 20:37:13.329	2026-01-16 04:26:20.538	f	\N	2026-01-16 03:33:26.35	clerk_user_25	INSTRUCTOR	\N	Nick25
87921304-7f86-4398-9e22-420170acdb03	admin@paceupcareer.com	\N	\N	2026-01-16 03:44:59.656	2026-01-16 04:25:54.37	f	\N	\N	user_38K4nsQvRHKpUo2ORvKpSCEAEWs	ADMIN	\N	\N
70fd529d-154d-43e5-8dcc-2127aa7651fc	user@paceupcareer.com	\N	\N	2026-01-16 03:47:40.011	2026-01-16 04:25:54.651	f	\N	\N	user_38K5898TBktdhW31nKDhgXUwZVF	USER	\N	\N
b566d525-a00a-47de-bad6-78e37df9b732	user1@example.com	User 1	\N	2025-09-29 02:24:25.225	2026-01-16 04:25:54.914	f	\N	2026-01-16 03:33:03.066	clerk_user_1	ADMIN	\N	Nick1
181ea423-a9e2-4c6f-92a6-33f5811288a5	user23@example.com	User 23	\N	2025-11-08 14:58:51.721	2026-01-16 04:26:17.757	f	\N	2026-01-16 03:33:25.793	clerk_user_23	ADMIN	\N	Nick23
9e6c4784-4864-4463-b26c-361de82a35c9	user26@example.com	User 26	\N	2026-01-06 02:41:39.566	2026-01-16 04:26:21.919	f	\N	2026-01-16 03:33:26.889	clerk_user_26	USER	\N	Nick26
f3ebabca-2a74-4d08-ab53-2c53a53ea094	user27@example.com	User 27	\N	2025-11-03 03:57:34.193	2026-01-16 04:26:22.196	t	\N	2026-01-16 03:33:27.506	clerk_user_27	USER	\N	Nick27
eb355158-5dde-4296-8617-b4bc16f32d8d	user28@example.com	User 28	\N	2026-01-09 15:37:28.409	2026-01-16 04:26:23.892	f	\N	2026-01-16 03:33:28.135	clerk_user_28	INSTRUCTOR	\N	Nick28
6ae6ac02-51fa-471b-bdac-569c87cba393	user29@example.com	User 29	\N	2025-12-31 00:34:33.24	2026-01-16 04:26:24.709	f	\N	2026-01-16 03:33:29.526	clerk_user_29	ADMIN	\N	Nick29
1b771c28-10e9-4d6b-980d-de4c5cb23d80	user30@example.com	User 30	\N	2025-10-13 14:04:24.695	2026-01-16 04:26:26.063	t	\N	2026-01-16 03:33:29.853	clerk_user_30	USER	\N	Nick30
12760052-6cf9-4cde-96ce-dd9ddcba4e4e	joseph.song@landseed.ca	jw s	\N	2026-01-20 01:58:23.501	2026-01-20 01:58:23.501	f	\N	\N	user_38VAKVEE5sipzrrMUWzjaPD9lJf	ADMIN	\N	\N
73c88c99-33dc-401d-a459-5d4718aca565	workshop-seed-sujin@paceupcareer.com	Sujin Ku	\N	2026-03-27 18:57:31.621	2026-03-27 18:57:31.621	f	\N	\N	seed_workshop_instructor_sujin_ku	INSTRUCTOR	\N	Sujin
f9e93c52-a6e3-4005-b904-d663800e8637	mirimkim00+admin@gmail.com	A bc	\N	2026-04-10 00:05:13.047	2026-04-10 00:05:13.047	f	\N	\N	user_3C8uRWPai58zyOn1u6IEAUqy9ba	USER	\N	\N
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."UserRole" ("id", "label") FROM stdin;
USER	일반 사용자
ADMIN	관리자
INSTRUCTOR	INSTRUCTOR
\.


--
-- Data for Name: Video; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."Video" ("id", "videoId", "title", "description", "uploadDate", "price", "category", "thumbnail", "courseId", "sectionId") FROM stdin;
11f018c8-c07c-4c38-89a4-663075e5b0a7	32ktrbrf3j	Session 1	\N	2026-01-16 04:25:37.667	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	13d969b8-da77-44c5-b0c0-737c832dbb1b
7baf4cc6-90a1-47fc-89a4-7cd5bfe48bc8	vidx-1-0-2-244162f9	Session 2	\N	2026-01-16 04:25:37.838	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	13d969b8-da77-44c5-b0c0-737c832dbb1b
fc461542-6545-41a9-910d-c420934c0b7b	vidx-1-0-3-158fd0c8	Session 3	\N	2026-01-16 04:25:38.028	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	13d969b8-da77-44c5-b0c0-737c832dbb1b
c6b9b4af-3ad4-43f7-97ed-6a96bebea199	vidx-1-0-4-bc0f1b4a	Session 4	\N	2026-01-16 04:25:38.183	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	13d969b8-da77-44c5-b0c0-737c832dbb1b
8b0a97fb-fa74-4502-8ef2-6657e871831c	vidx-1-1-1-9b983ba8	Session 1	\N	2026-01-16 04:25:38.358	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	9a4fe199-994b-407b-8fba-201ba10b37e3
45a9a5ba-f145-4d74-b6a3-5a1e6673d5e8	vidx-1-1-2-295eff8f	Session 2	\N	2026-01-16 04:25:38.509	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	9a4fe199-994b-407b-8fba-201ba10b37e3
e0485b05-0f4e-4c69-b474-2f80c3ae4eec	vidx-1-1-3-8c2a7070	Session 3	\N	2026-01-16 04:25:38.658	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	9a4fe199-994b-407b-8fba-201ba10b37e3
42c14b03-6e48-4155-9b58-2d8981fa33ff	vidx-1-1-4-2dd55109	Session 4	\N	2026-01-16 04:25:38.823	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	9a4fe199-994b-407b-8fba-201ba10b37e3
4fbbb4c7-cabc-4850-9875-77cdfcb6e752	vidx-1-2-1-2a305086	Session 1	\N	2026-01-16 04:25:38.973	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	fb875e23-8d5b-495a-8554-6f287f718df9
d26498ea-409f-4b67-9ca9-6ca653919cfb	vidx-1-2-2-08291c27	Session 2	\N	2026-01-16 04:25:39.131	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	fb875e23-8d5b-495a-8554-6f287f718df9
cbf09072-2b62-4dab-be94-3b4056e77f53	vidx-1-2-3-f882367d	Session 3	\N	2026-01-16 04:25:39.297	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	fb875e23-8d5b-495a-8554-6f287f718df9
ff585e09-b25f-4d54-8b54-74b2a9828716	vidx-1-2-4-ddc4b0a5	Session 4	\N	2026-01-16 04:25:39.447	\N	INTERVIEW	/img/course_image1.png	59694697-fe29-4cdb-9627-628d94302814	fb875e23-8d5b-495a-8554-6f287f718df9
65adfe2c-2117-40d1-9acc-3e2296d7e458	vidx-2-0-1-81433157	Session 1	\N	2026-01-16 04:25:40.496	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	c224e413-9523-44a2-ac23-ec0a7a524d57
784044b1-8d7b-4b8d-8399-de99fd6b6191	vidx-2-0-2-9c40bbf5	Session 2	\N	2026-01-16 04:25:40.655	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	c224e413-9523-44a2-ac23-ec0a7a524d57
e490695c-7e03-4415-ae6f-8e7e06f0f2cc	vidx-2-0-3-47372e26	Session 3	\N	2026-01-16 04:25:40.806	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	c224e413-9523-44a2-ac23-ec0a7a524d57
1478d6d8-888d-4e41-a37b-e0848cb6edad	vidx-2-0-4-25caff1c	Session 4	\N	2026-01-16 04:25:40.959	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	c224e413-9523-44a2-ac23-ec0a7a524d57
8fbf9100-945d-4a79-ae64-e8eca5401502	vidx-2-1-1-c731c095	Session 1	\N	2026-01-16 04:25:41.113	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	c8781d3f-9c71-449c-b711-7703bc6e6cdf
5e041f1d-3fc8-4f0a-b600-0ef04aaf65ed	vidx-2-1-2-fba38cb6	Session 2	\N	2026-01-16 04:25:41.275	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	c8781d3f-9c71-449c-b711-7703bc6e6cdf
f42c780c-db8e-48c9-8eae-6c87a8985c85	vidx-2-1-3-fdebd30a	Session 3	\N	2026-01-16 04:25:41.422	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	c8781d3f-9c71-449c-b711-7703bc6e6cdf
8b7d516b-506f-45b9-81c9-fcaa3467edd8	vidx-2-1-4-c9cfbb12	Session 4	\N	2026-01-16 04:25:41.572	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	c8781d3f-9c71-449c-b711-7703bc6e6cdf
a07cd8c8-6725-4371-b6c8-3e4006dbd45f	vidx-2-2-1-44f68ff3	Session 1	\N	2026-01-16 04:25:41.719	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	a985789a-894a-42ce-a8cc-1330cb4e2b3d
e2d78fab-d16c-40d8-adc4-7061f0c46fdf	vidx-2-2-2-962b114a	Session 2	\N	2026-01-16 04:25:41.865	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	a985789a-894a-42ce-a8cc-1330cb4e2b3d
9f7d8dfb-e274-488c-beec-a17ad98fa687	vidx-2-2-3-fa9c9003	Session 3	\N	2026-01-16 04:25:42.013	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	a985789a-894a-42ce-a8cc-1330cb4e2b3d
b33c32ca-6837-4d65-b928-153235bcc6cd	vidx-2-2-4-424eb5c5	Session 4	\N	2026-01-16 04:25:42.161	\N	INTERVIEW	/img/course_image2.png	87f6741e-4ef1-481d-bc9b-3d9fe73607cb	a985789a-894a-42ce-a8cc-1330cb4e2b3d
d912cae2-f5ab-44ee-8154-4b8b3b72074e	vidx-3-0-1-b5af5b44	Session 1	\N	2026-01-16 04:25:43.185	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	8b05d115-e2e5-4314-914b-aeb34585c221
ee91059a-1041-4a47-b139-cd3f35e431a5	vidx-3-0-2-278ed552	Session 2	\N	2026-01-16 04:25:43.346	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	8b05d115-e2e5-4314-914b-aeb34585c221
2ba0db19-898e-4d82-8f0d-d6e30dc71ed3	vidx-3-0-3-0e2fa5a1	Session 3	\N	2026-01-16 04:25:43.493	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	8b05d115-e2e5-4314-914b-aeb34585c221
104e21d9-b9ef-4024-9cd2-aa10e1a72bfd	vidx-3-0-4-806dda83	Session 4	\N	2026-01-16 04:25:43.652	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	8b05d115-e2e5-4314-914b-aeb34585c221
e2311ce0-999c-44d9-bfd8-bc3df49473f5	vidx-3-1-1-d67b9995	Session 1	\N	2026-01-16 04:25:43.805	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	ded7ad48-a8e2-4624-aea0-f31570c9741b
28a4e7ec-6bc5-4e28-82ad-0af4f1435423	vidx-3-1-2-3606a571	Session 2	\N	2026-01-16 04:25:43.965	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	ded7ad48-a8e2-4624-aea0-f31570c9741b
9bc727b3-d9a2-40f7-9b15-6e185b4134a1	vidx-3-1-3-2bf88cd4	Session 3	\N	2026-01-16 04:25:44.118	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	ded7ad48-a8e2-4624-aea0-f31570c9741b
e5f102b4-1bf7-4228-917e-751c0fc30025	vidx-3-1-4-ed1f3e83	Session 4	\N	2026-01-16 04:25:44.29	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	ded7ad48-a8e2-4624-aea0-f31570c9741b
024108bc-1b1f-4bc0-86ca-6a4e9aaf7343	vidx-3-2-1-f3047ccf	Session 1	\N	2026-01-16 04:25:44.448	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	77ba50f7-f88d-45ba-8cf6-3086f7b3aa7b
719d0c2a-b4a7-4c2a-91f4-5d9526ad3a49	vidx-3-2-2-82177637	Session 2	\N	2026-01-16 04:25:44.596	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	77ba50f7-f88d-45ba-8cf6-3086f7b3aa7b
06633497-d68d-4f26-9aff-978a651af31b	vidx-3-2-3-00f05319	Session 3	\N	2026-01-16 04:25:44.746	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	77ba50f7-f88d-45ba-8cf6-3086f7b3aa7b
169d9539-4272-4b16-8d4a-9825d97ca92c	vidx-3-2-4-985e7a8b	Session 4	\N	2026-01-16 04:25:44.907	\N	INTERVIEW	/img/course_image3.png	51c1a6e8-5641-46fd-ae62-10d1a43c0c22	77ba50f7-f88d-45ba-8cf6-3086f7b3aa7b
19fb5f27-8624-4710-bf01-59493ea308e0	vidx-4-0-1-87d8f17a	Session 1	\N	2026-01-16 04:25:45.976	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	a8f5096b-2136-48bf-957f-cd3d07bf056e
d2b56f1e-3dd7-4554-a629-2ae3c8734785	vidx-4-0-2-43bea169	Session 2	\N	2026-01-16 04:25:46.128	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	a8f5096b-2136-48bf-957f-cd3d07bf056e
12e7acc4-c387-477f-b5e6-d1e1441fb134	vidx-4-0-3-98cf6f51	Session 3	\N	2026-01-16 04:25:46.285	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	a8f5096b-2136-48bf-957f-cd3d07bf056e
2a1d4f3f-e53a-4f6e-a059-3ae440c76bd7	vidx-4-0-4-fbcdead4	Session 4	\N	2026-01-16 04:25:46.436	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	a8f5096b-2136-48bf-957f-cd3d07bf056e
238a2416-9aa1-4cc8-b9c1-ccb20738da5b	vidx-4-1-1-79f0e738	Session 1	\N	2026-01-16 04:25:46.595	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	5c3a9d95-0796-4fce-a958-6b90014185df
29f0aa02-3f8f-4019-87bb-5a0d201fac00	vidx-4-1-2-b254068d	Session 2	\N	2026-01-16 04:25:46.745	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	5c3a9d95-0796-4fce-a958-6b90014185df
838f7820-1c3f-4bc0-9a08-33fc072dd2b4	vidx-4-1-3-034d2d0a	Session 3	\N	2026-01-16 04:25:46.9	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	5c3a9d95-0796-4fce-a958-6b90014185df
cf018c52-6437-41d5-9652-a9e9ccb4b9bf	vidx-4-1-4-f725bd4a	Session 4	\N	2026-01-16 04:25:47.049	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	5c3a9d95-0796-4fce-a958-6b90014185df
62ce493c-cb8b-499f-8d73-8729baa6e09b	vidx-4-2-1-0ae20be8	Session 1	\N	2026-01-16 04:25:47.202	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	3a8dffa6-753c-4a0a-b55d-2d730743a23d
6a201477-2c44-4f2d-bc5d-d9306a4aebe5	vidx-4-2-2-1cc0744b	Session 2	\N	2026-01-16 04:25:47.353	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	3a8dffa6-753c-4a0a-b55d-2d730743a23d
89dc73fd-9c8a-4263-b1d6-3ae8dd96d04d	vidx-4-2-3-c7b57545	Session 3	\N	2026-01-16 04:25:47.513	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	3a8dffa6-753c-4a0a-b55d-2d730743a23d
3ee64de0-ce30-4091-b067-cfc4d5a0b85f	vidx-4-2-4-c3e11431	Session 4	\N	2026-01-16 04:25:47.662	\N	INTERVIEW	/img/course_image1.png	1042ae1e-aa2b-470e-a2f1-1da830e244f8	3a8dffa6-753c-4a0a-b55d-2d730743a23d
3fbee5af-f2c6-4fcf-b469-0fb0059c4d79	vidx-5-0-1-74605c33	Session 1	\N	2026-01-16 04:25:48.841	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	1f23ee16-52b4-4cb2-b15d-141895be786d
763504c8-83eb-4327-95ba-d60b7d57647b	vidx-5-0-2-d14d9336	Session 2	\N	2026-01-16 04:25:48.991	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	1f23ee16-52b4-4cb2-b15d-141895be786d
c6bd8fc5-e52b-4485-bdf0-9ee77dd3045e	vidx-5-0-3-f55920fd	Session 3	\N	2026-01-16 04:25:49.158	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	1f23ee16-52b4-4cb2-b15d-141895be786d
703ba597-1d71-430e-a058-a750152af06b	vidx-5-0-4-b2ad234c	Session 4	\N	2026-01-16 04:25:49.31	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	1f23ee16-52b4-4cb2-b15d-141895be786d
14414ac5-41ea-4499-af36-a0bdbab923ef	vidx-5-1-1-956d6bcd	Session 1	\N	2026-01-16 04:25:49.458	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	eadd0efb-9544-4343-903d-d4046c13ce42
d71b766f-cae0-4c19-a796-2c8188018c37	vidx-5-1-2-9936781d	Session 2	\N	2026-01-16 04:25:49.622	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	eadd0efb-9544-4343-903d-d4046c13ce42
70d64cff-2c37-49ff-96ed-4a970f373adb	vidx-5-1-3-936702f7	Session 3	\N	2026-01-16 04:25:49.772	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	eadd0efb-9544-4343-903d-d4046c13ce42
aff1ed8a-8dcb-4d8f-a34e-8d659180b99a	vidx-5-1-4-60eaf715	Session 4	\N	2026-01-16 04:25:49.92	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	eadd0efb-9544-4343-903d-d4046c13ce42
1074d412-9336-4e06-9903-f07a16d619fb	vidx-5-2-1-e84f96c2	Session 1	\N	2026-01-16 04:25:50.101	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	9b6bbca6-e71a-4a61-8387-e42dd3323725
c45ff33e-a7cc-46fb-a1f1-9bccdcdb6f3c	vidx-5-2-2-62fe0691	Session 2	\N	2026-01-16 04:25:50.249	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	9b6bbca6-e71a-4a61-8387-e42dd3323725
5d414da7-ec78-4487-b91d-136ef6cf7e8b	vidx-5-2-3-563861f5	Session 3	\N	2026-01-16 04:25:50.411	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	9b6bbca6-e71a-4a61-8387-e42dd3323725
ccb7757a-65fd-46ab-9a73-a51a88b73fd0	vidx-5-2-4-fabf1110	Session 4	\N	2026-01-16 04:25:50.566	\N	INTERVIEW	/img/course_image2.png	551cdb89-263c-4c23-85a7-8b53bb1d2c82	9b6bbca6-e71a-4a61-8387-e42dd3323725
726bb48f-5acd-483f-978a-e42ba5f334c6	vidx-6-0-1-536d845c	Session 1	\N	2026-01-16 04:25:51.59	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	38a5533c-6d81-4b49-843e-b3e58111f9be
fa36c105-6742-416a-be22-70d7f7ab299b	vidx-6-0-2-27abd47a	Session 2	\N	2026-01-16 04:25:51.75	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	38a5533c-6d81-4b49-843e-b3e58111f9be
225c0d47-7166-4cd1-9ec8-1b6dbb7a009b	vidx-6-0-3-d54a4fe6	Session 3	\N	2026-01-16 04:25:51.908	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	38a5533c-6d81-4b49-843e-b3e58111f9be
8108315b-bae4-4a56-ad47-598160042d28	vidx-6-0-4-c07f03ec	Session 4	\N	2026-01-16 04:25:52.058	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	38a5533c-6d81-4b49-843e-b3e58111f9be
32c8dbee-8643-4fd3-b9bc-d4225e5a1bc2	vidx-6-1-1-e8e8bf52	Session 1	\N	2026-01-16 04:25:52.207	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	92d1c352-f0b0-4020-b178-94ddfa60b262
8c3a0ce3-c048-46e0-8595-b127ccb0d335	vidx-6-1-2-7f220107	Session 2	\N	2026-01-16 04:25:52.362	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	92d1c352-f0b0-4020-b178-94ddfa60b262
8ad85c5f-2c72-448e-b9dd-1c882ead64f0	vidx-6-1-3-3a502efb	Session 3	\N	2026-01-16 04:25:52.539	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	92d1c352-f0b0-4020-b178-94ddfa60b262
2d03a3ff-c520-4097-b2f3-b6b2d0a4a054	vidx-6-1-4-89c8e586	Session 4	\N	2026-01-16 04:25:52.72	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	92d1c352-f0b0-4020-b178-94ddfa60b262
03e4a191-e4eb-422c-b9e8-2a5e777d1ee7	vidx-6-2-1-8f325414	Session 1	\N	2026-01-16 04:25:52.886	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	ccb84ef5-69d4-4c50-be2b-e39f50416d56
f68b7bf6-3c46-4f9e-87da-7452b8085312	vidx-6-2-2-7b5dbcae	Session 2	\N	2026-01-16 04:25:53.04	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	ccb84ef5-69d4-4c50-be2b-e39f50416d56
b2268272-88cf-4437-a922-c125a9bd9700	vidx-6-2-3-28888975	Session 3	\N	2026-01-16 04:25:53.227	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	ccb84ef5-69d4-4c50-be2b-e39f50416d56
1c9f86a6-2d5b-4db0-969c-3d9f955c2dd6	vidx-6-2-4-69df3147	Session 4	\N	2026-01-16 04:25:53.378	\N	INTERVIEW	/img/course_image3.png	2392d3ea-e47c-4854-bb16-c8a39ff114dc	ccb84ef5-69d4-4c50-be2b-e39f50416d56
525887f1-58f7-4425-a1e5-e2e438cedf48	temp-0.7543654249874527			2026-04-23 17:29:22.714	\N	\N	\N	41821778-d487-4442-83f5-cb4fb0173df1	855b4ab7-aaf4-4354-8dbd-46f3e3ec8f10
\.


--
-- Data for Name: WatchedVideo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."WatchedVideo" ("id", "userId", "watchedAt", "progress", "videoId") FROM stdin;
\.


--
-- Data for Name: Workshop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."Workshop" ("id", "title", "description", "startDate", "endDate", "price", "locationOrUrl", "status", "instructorId", "createdAt", "updatedAt", "thumbnail", "category") FROM stdin;
8b985fc2-27a6-48e2-ba89-324d6318bd02	Resume Workshop for International Opportunities	Join this workshop to gain valuable insights and boost your career.	2026-11-05 19:00:00	2026-11-05 21:00:00	20	North York centre	RECRUITING	73c88c99-33dc-401d-a459-5d4718aca565	2026-03-27 18:57:31.621	2026-03-27 18:57:31.621	/img/course_image2.png	NETWORKING
cbe1979f-fdf8-471b-9240-cd8d26c9e23c	UX Design Workshop	Everyone has unique strengths and potential.\nIn this session, you'll gain powerful insights into navigating challenges in a global career environment, leveraging the power of networking, and discovering your own path forward.\nDon't miss this exclusive opportunity to learn directly from Sujin Ku, Career Coach at the University of Toronto.	2026-03-20 19:00:00	2026-03-20 21:00:00	20	North York centre	RECRUITING	73c88c99-33dc-401d-a459-5d4718aca565	2026-03-27 18:57:31.621	2026-03-27 18:57:31.621	/img/course_image1.png	NETWORKING
5586b837-0f07-474a-8fb2-cafe297b8c46	UX Design Workshop	Everyone has unique strengths and potential.\nIn this session, you'll gain powerful insights into navigating challenges in a global career environment, leveraging the power of networking, and discovering your own path forward.\nDon't miss this exclusive opportunity to learn directly from Sujin Ku, Career Coach at the University of Toronto.	2026-03-05 19:00:00	2026-03-05 21:00:00	20	North York centre	COMPLETED	73c88c99-33dc-401d-a459-5d4718aca565	2026-03-27 18:57:31.621	2026-03-27 18:57:31.621	/img/course_image1.png	NETWORKING
2f3a0a43-e2b8-409e-87fe-ffd783e8bd54	UX Design Workshop	Everyone has unique strengths and potential.\nIn this session, you'll gain powerful insights into navigating challenges in a global career environment, leveraging the power of networking, and discovering your own path forward.\nDon't miss this exclusive opportunity to learn directly from Sujin Ku, Career Coach at the University of Toronto.	2026-02-10 19:00:00	2026-02-10 21:00:00	20	North York centre	COMPLETED	73c88c99-33dc-401d-a459-5d4718aca565	2026-03-27 18:57:31.621	2026-03-27 18:57:31.621	/img/course_image1.png	NETWORKING
02439d8d-cc5e-4a61-9f76-39ef8e4242d8	UX Design Workshop	Everyone has unique strengths and potential.\nIn this session, you'll gain powerful insights into navigating challenges in a global career environment, leveraging the power of networking, and discovering your own path forward.\nDon't miss this exclusive opportunity to learn directly from Sujin Ku, Career Coach at the University of Toronto.	2026-01-15 19:00:00	2026-01-15 21:00:00	20	North York centre	COMPLETED	73c88c99-33dc-401d-a459-5d4718aca565	2026-03-27 18:57:31.621	2026-03-27 18:57:31.621	/img/course_image1.png	NETWORKING
55ed43d0-2de3-4e87-adb2-72675b30f8f6	Build an English Resume for Career Transitions	Join this workshop to gain valuable insights and boost your career.	2026-08-10 19:00:00	2026-08-10 21:00:00	20	North York centre	RECRUITING	73c88c99-33dc-401d-a459-5d4718aca565	2026-03-27 18:57:31.621	2026-03-27 18:57:31.621	/img/course_image1.png	RESUME
ecf6faae-fd9b-487a-b5b1-2b50250968c1	Mind Training for Success	Join this workshop to gain valuable insights and boost your career.	2026-03-16 19:00:00	2026-03-16 21:00:00	20	North York centre	COMPLETED	73c88c99-33dc-401d-a459-5d4718aca565	2026-03-27 18:57:31.621	2026-03-27 18:57:31.621	/img/course_image2.png	NETWORKING
f9f37357-ad91-4a92-8ec0-638cc54ff769	Let's Connect!	Join this workshop to gain valuable insights and boost your career.	2026-05-15 19:00:00	2026-05-15 21:00:00	20	North York centre	RECRUITING	73c88c99-33dc-401d-a459-5d4718aca565	2026-03-27 18:57:31.621	2026-03-27 18:57:31.621	/img/course_image3.png	NETWORKING
\.


--
-- Data for Name: WorkshopRegistration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."WorkshopRegistration" ("id", "userId", "workshopId", "registeredAt", "attended", "orderId") FROM stdin;
\.


--
-- Data for Name: _CourseToInstructor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."_CourseToInstructor" ("A", "B") FROM stdin;
b3bd438d-0cad-4ee9-9367-07288a63d3ef	5c3418f2-639e-40fd-8cc3-aa2acb8e4392
5485ad91-1c94-401d-8b95-a0e25190e957	529238e8-db71-495c-8075-d539cfdea338
41821778-d487-4442-83f5-cb4fb0173df1	23dc6ef5-7395-4bdf-b580-3d1d102f44b8
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") FROM stdin;
119d873a-ee70-48f4-ac84-64e7d1173ed6	8788f9de64f4520e4f44030881faf2c182e6b1dd8c43083ca5597f3fd70079bd	2025-12-18 11:41:26.839502+00	20251127031355_add_section_table	\N	\N	2025-12-18 11:41:26.634205+00	1
acce45cf-7f06-44b4-b7dc-802f5a6d59c7	3d659d1ae03858cca7fd2e43460b65327cef73de8be422b8ce8c76c0504ef029	2025-11-18 01:47:29.984603+00	20250211152637_init_create_base_schema	\N	\N	2025-11-18 01:47:29.862052+00	1
50054562-2638-4693-ac7c-5aef3606baa3	66d14ffe03f8c8108a5072e05b6ae446d79f7c2e5442e49a53413ba4e43ccd93	2025-11-18 01:47:31.679148+00	20250606235640_add_favorite_and_refactor_orderitem	\N	\N	2025-11-18 01:47:31.588827+00	1
d7d85b46-dee4-4076-ac10-cb6ab792aafb	645bcf1d75051ecc4789d35ab6511c33cfee2aab12160c006eaf49400647e389	2025-11-18 01:47:30.114215+00	20250211200133_feat_add_clerkid_and_use_app_uuid	\N	\N	2025-11-18 01:47:30.019089+00	1
78de09cd-ee59-4f87-8717-106ea697cbb9	fde2dc80c5c8685653f6ff93892adbbb9fa312f30e8ff534932d1b94a3627c83	2025-11-18 01:47:30.245484+00	20250212005008_test	\N	\N	2025-11-18 01:47:30.149664+00	1
0067ebbc-5935-4a5b-9ba9-a87cca0fc7a4	4dc46f7ce549f2d12e2dd11a91a74c9895c2f479bdf01a5deda379748513d525	2025-11-18 01:47:32.694837+00	20251006202231_add_interest	\N	\N	2025-11-18 01:47:32.613522+00	1
26f2ac9a-bcc7-491c-b2a6-5b4302cc58fc	d1108dabc276d6189fedcd78fd7a7cc5f7a11328789fd0205644ae7d2cd96196	2025-11-18 01:47:30.389932+00	20250212021509_create_watchedvideo_purchasedvideo_remove_userid_from_video	\N	\N	2025-11-18 01:47:30.281549+00	1
cc4c6ad2-c318-4f14-9322-c6e40eb530ed	bf06a51dd1687125bb4e26948fc2b72d1ac0674d6c3ebac6588f097e0773675e	2025-11-18 01:47:31.804813+00	20250614005454_add_user_role_table_remove_role_enum	\N	\N	2025-11-18 01:47:31.713398+00	1
77353519-9107-4e90-b6dc-19eb5dc2f964	ef991eaf671080a41eab6c9c667a2746a364c468bf87722c46dcf44549768206	2025-11-18 01:47:30.509807+00	20250212021706_remove_test	\N	\N	2025-11-18 01:47:30.421019+00	1
548c55f7-f046-4417-805a-b70d953ee5bb	7e76640c9f5ec0227820371a2943f00a20213f36ed5e9bf260d338890aaeab82	2025-11-18 01:47:30.63674+00	20250220225608_create_purchaseddocument	\N	\N	2025-11-18 01:47:30.54241+00	1
384ff4b2-cc56-436a-8608-2d7f3428e169	2ab2918d52ceb6c21dee2b9e49e160ae1e1eed441a919e17dd68a4b38c4928fe	2025-11-18 01:47:30.755035+00	20250319144524_add_bucketurl	\N	\N	2025-11-18 01:47:30.669659+00	1
a06460ca-7acf-4697-a132-4490ed340c91	927131f43d243815f1ca0dfcddbac4c3895acac2d9c73e4e8270ced4236ba505	2025-11-18 01:47:31.948568+00	20250617225832_refactor_orderitem_favorite_add_itemtype_item_id	\N	\N	2025-11-18 01:47:31.845642+00	1
8b9b7821-d10d-4107-b4e3-1caf6421808c	46f5e332c22492bf52809752685676242b25803df6cce473f76586ad2bbfccc9	2025-11-18 01:47:30.898114+00	20250407021656_add_relation_mode	\N	\N	2025-11-18 01:47:30.79417+00	1
c95785f3-abe8-43c0-b82f-4875d7ed8fac	3bf7f815d2dfcf8c400d0ea13257b91cfec859f24f13b1e12366074a23850504	2025-11-18 01:47:31.028375+00	20250416144808_add_paceuser_table	\N	\N	2025-11-18 01:47:30.933671+00	1
3c12ee37-a58c-4d9e-835a-d650e36b28ba	25f0afc916c1e1e9d79c026285164a3a977eed20ba8f686097743511536a6a0f	2025-11-18 01:47:31.152524+00	20250416163514_remove_paceuser_table	\N	\N	2025-11-18 01:47:31.062731+00	1
e3dea939-0fb8-4c99-8ce7-788266ebaab2	7032a8001cfbb8d2476fbe2b01d48484ff2e2bf21ef24598609de03ce31d74d8	2025-11-18 01:47:32.08042+00	20250725003607_add_image_table	\N	\N	2025-11-18 01:47:31.979631+00	1
e19df494-d509-4e30-8eab-09ab2fb6b4a1	a3e3f5a53e563105b2f8cb33bf0da0917fdd32641fab9ddcdc97d3803f969393	2025-11-18 01:47:31.288578+00	20250516013434_added_workshop_feature	\N	\N	2025-11-18 01:47:31.195862+00	1
42f879e2-d3b2-4b09-8708-7e2cff2bdefc	bb64ff6b0e5374e7d612a3b24344355dec45172644e8e0822b121857a896dfec	2025-11-18 01:47:31.419108+00	20250522153700_add_video_category	\N	\N	2025-11-18 01:47:31.322261+00	1
eff346f9-c2bb-4bd7-9ada-3d77a2af60da	52ed6f7bd670577bf007e133663d994060095ecd305fdfc0011f68c684fa9124	2025-11-18 01:47:32.818265+00	20251013194213_add_nickname	\N	\N	2025-11-18 01:47:32.733382+00	1
801055cd-570d-4237-aaf1-344e8e6ed3d3	fce41b64766c8607b03cb956d055c1388414d8d514073a9af51f9554f5170f5a	2025-11-18 01:47:31.548414+00	20250605233246_add_order_system	\N	\N	2025-11-18 01:47:31.453475+00	1
cfe21791-da42-4898-9bd1-96e204ef26c9	156ea2ac29ae554701a24702c2614e551145cc8f41572db5c496ece100427419	2025-11-18 01:47:32.210469+00	20250801010034_add_thumbnail_to_video_and_workshop	\N	\N	2025-11-18 01:47:32.117453+00	1
2e42f095-0f4d-4936-8a23-e4aeb0685f48	6b7f388c980539a4171078423a62ecb78faa3f753944187909423e6d45127245	2025-11-18 01:47:32.339376+00	20250826003106_add_cart_table	\N	\N	2025-11-18 01:47:32.244458+00	1
d5201e19-5a21-4a43-b7a1-bb976ebc9f54	ad0c1ee43d94e796c5ef451ab5d65f0b13e777c65ce210e73d1fc37ce07c743b	2026-01-16 01:05:23.383652+00	20251221042818_add_course_display_fields	\N	\N	2026-01-16 01:05:23.253373+00	1
db69a57d-c955-4fa8-a529-d69d3549468a	717c575e2b864148295f26a7b642e618e189bec52b61e807cb1aee13f03d856f	2025-11-18 01:47:32.45738+00	20251001173330_add_mock_category_to_document	\N	\N	2025-11-18 01:47:32.372476+00	1
752178ff-3879-404a-922f-822854f0d3a3	b28ace61d13e54c0aeeb81aa085ab6c12c754a5727392116a264c70bae0c0eaa	2025-11-18 01:47:32.944322+00	20251027002023_add_course_table	\N	\N	2025-11-18 01:47:32.851832+00	1
29118861-5c4a-4c11-bb02-20158baad8e7	022fe102e7630adac5f2155bc424627ef32b538183c7c6f634ab29cf6e9fa3d3	2025-11-18 01:47:32.580018+00	20251006182051_add_document_category	\N	\N	2025-11-18 01:47:32.490405+00	1
70649562-2285-4236-8222-7733bd565de2	fa57818db635ae594c329e281039c96cc21fb1755d4a3b5742bf5de3ef0fed1f	2025-12-18 11:41:27.068602+00	20251127131254_add_section_item_table	\N	\N	2025-12-18 11:41:26.903708+00	1
ad4af029-e7d6-4628-9d9d-9f8fe631d6cd	f36689d62b64295ebd634b787f4f013cdc254e36428e65df00361ddfcfb026b9	2025-11-18 01:47:33.080412+00	20251117000219_npx_prisma_db_seed	\N	\N	2025-11-18 01:47:32.980072+00	1
41771465-3bb2-4a79-82a5-144ad06fc951	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-12-18 11:41:26.571926+00	20251127021845_check_sync	\N	\N	2025-12-18 11:41:26.40042+00	1
f374dbfe-b5f9-4550-af2b-cb7c465289c9	3557f3909884991cc1a0594f3ea252da887ee940dabf499ae1dc544033a2b008	2025-12-18 11:41:27.785628+00	20251129033302_delete_subtitle_column_in_course	\N	\N	2025-12-18 11:41:27.61108+00	1
63b58d30-2749-44b8-9028-94972d9665fa	1bfe64c94b3218b7bf6663979607de24e406457976a76b1a0a845a6cbd9936d4	2025-12-18 11:41:27.310512+00	20251128010300_add_video_relations	\N	\N	2025-12-18 11:41:27.129861+00	1
b6a78b75-abc1-4948-95c5-3e408a1616c5	fd7f23882e161c1af6b620772d1687328c126825ec9428ff351ecf69f7b759e2	2026-01-16 01:05:23.206679+00	20251217024125_add_review_model	\N	\N	2026-01-16 01:05:22.975512+00	1
df499e36-fa1e-4add-9ef2-081e45d1b44c	8d4eb99244f9a4f0ba769461b6674b27f58ba150227d89a6a4318a6478aa7f52	2025-12-18 11:41:27.539126+00	20251128011524_remove_json_sections_and_reviews	\N	\N	2025-12-18 11:41:27.372472+00	1
0bf0227b-f4fe-4205-957f-7fa6004df97d	ad4f1f2c91ab46aaefecf1ce832d2a43f9a969a9e2ef1b5863f74ada7c63e570	2025-12-18 11:41:28.019985+00	20251129050645_add_course_category_enum	\N	\N	2025-12-18 11:41:27.849628+00	1
fb851328-7445-4b3d-a6f5-7d944e50f4b6	70d0ed6b9ff0db6a14bb25458cca7ca912b0d96cd49d4277f7c5fd97f03d8a81	2026-01-16 01:05:23.559313+00	20251224020129_add_course_target_audience	\N	\N	2026-01-16 01:05:23.43073+00	1
5ff9ac2e-09b0-40db-98f9-fbffc7b1956e	3fb720082bd082b69011d73677463b6b6ce08e8b5b70f431509ec6862655915c	2026-01-16 01:05:23.739274+00	20251224023243_add_target_audience_type	\N	\N	2026-01-16 01:05:23.606218+00	1
8aaccbc0-46cf-4cde-9d89-30eac0f98a22	9bf1d71701e8f0b8cf0bc7fd1057f5a3c5092edad3cd046860ec3a5e75485cb1	2026-01-16 01:05:23.910143+00	20251224025634_remove_section_type	\N	\N	2026-01-16 01:05:23.785928+00	1
76352538-a78a-4221-a7bc-ecdbda5311b4	b4039b7a4859fd3899ba93fab1c1486a654b22f41a766c42653f95b58305204c	2026-01-16 01:05:24.088657+00	20260104152230_add_target_audience_types	\N	\N	2026-01-16 01:05:23.956954+00	1
e7964c20-7fc1-4ba3-aeea-6c646b30db96	a6827fe7bd7a3f784e1f9a10fa484061f8cf55a0412641c4fcb984055e717f14	2026-04-01 02:02:13.814014+00	20260318012820_align_course_schema_final	\N	\N	2026-04-01 02:02:13.451742+00	1
a88e3df8-bd72-4678-a03c-d9185d7ff598	14dfb1e4351b6a126e98b6d81392fc15ad6e380d435c8584bf211a35b0e022a3	2026-01-16 01:05:24.257359+00	20260109010619_ebook_structure_and_section_rename	\N	\N	2026-01-16 01:05:24.13529+00	1
8a8f5d56-a8f9-4d4a-9e56-df149129ad8d	b63b268867a5529ad0eb9cd1f275f33078a7e34b0628abbd0e2535d3a85eab55	2026-03-12 17:44:27.613343+00	20260104043507_add_workshop_category_enum	\N	\N	2026-03-12 17:44:27.063738+00	1
7833efcd-0c30-4507-9784-225c54d6f077	f49d6ef336b11a84bbc9600f78c70bcda38c81e60aff9b3fac469dc115a0e855	2026-03-12 17:44:28.107966+00	20260125232618_add_document_recommended_links_and_target_audience	\N	\N	2026-03-12 17:44:27.753284+00	1
234850cb-eb76-49fc-99af-99fd78c13390	e3b0537fefea564fa4174108a4f9b95518163fd3c558d4d29b8fd9885ea88cdc	2026-04-17 00:31:01.732565+00	20260403005733_add_recommended_links_to_course	\N	\N	2026-04-17 00:31:01.304131+00	1
6a849a49-ba7c-415a-a7bc-f13639cd08fe	e8d7dbc3324a7e9861d5332b898c184df03ee14a4f5002f76ee20c32142877ca	2026-03-12 17:44:28.601843+00	20260129232955_update_targetAudience_to_targetAudienceTypes	\N	\N	2026-03-12 17:44:28.248192+00	1
96f2cd82-f48a-44ae-a017-c709cbc9910c	837838c457e09d31edfedd06a59b4b62a472ef28226118eaeb39dfcd4c779ab1	2026-03-12 17:44:29.252117+00	20260130053738_change_course_instructor_relation	\N	\N	2026-03-12 17:44:28.741729+00	1
dc1db1b5-cb75-44ad-8e25-bd8cfa0fc959	8c35507824c4e54f46097a98a0356ea343d5e174d883d4a5c0513e76fb534c1b	2026-03-12 17:44:29.746307+00	20260220014754_add_main_visual	\N	\N	2026-03-12 17:44:29.392996+00	1
2a18f3fd-f2b8-40aa-bf8f-f1174348c3bd	7ebaf71100b7ec861be59cb724c3daad95a953e85032ed6e53bcdc78623d2b07	2026-04-17 00:31:02.328307+00	20260403010004_remove_global_related_item	\N	\N	2026-04-17 00:31:01.899792+00	1
2a9e14aa-b6cf-434f-ac66-af51d47ad687	2e8c1aa039f5746961707b379f4652759cd041fcb8d9607c349845c203265ec7	2026-03-12 17:44:30.237552+00	20260220025232_add_missing_is_public_column_course_table	\N	\N	2026-03-12 17:44:29.886257+00	1
fc003915-daf5-4ff6-a6a5-3ec6ae7488fc	301e55b10e8af7f15966eaff11b75401c59acc70daf2923256ed297955886903	2026-03-12 17:44:30.729165+00	20260305022531_add_course_is_main	\N	\N	2026-03-12 17:44:30.377776+00	1
ff5d7a93-b07d-4a39-b8b2-51325062f67a	1559919991c70680d370db86f0af234e09969bb0dff6036c7d21d18a727dbe79	2026-03-27 01:00:27.67741+00	20260115160823_update_workshop_enum_seed_data	\N	\N	2026-03-27 01:00:27.526653+00	1
298316c4-3501-45ed-8ae8-9435c9bb87cd	6eb17e1acf294a34ffaad1bd6827f81bbf168d1959842bb3559a2567684ca501	2026-03-27 01:00:28.326685+00	20260115161848_remove_ongoing_workshop_enum	\N	\N	2026-03-27 01:00:27.722944+00	1
8664f7b0-60f8-485a-95fb-370fe166566e	e6a129cf42823a3b908191e6faeb8a5210490e49aff167229c612297df08246e	2026-04-01 02:02:13.317396+00	20260316013745_delete_section_item_table	\N	\N	2026-04-01 02:02:12.80443+00	1
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") FROM stdin;
document	document	\N	2025-03-10 22:21:16.742337+00	2025-03-10 22:21:16.742337+00	f	f	\N	\N	\N	STANDARD
image	image	\N	2025-07-25 00:46:15.759494+00	2025-07-25 00:46:15.759494+00	f	f	\N	\N	\N	STANDARD
2917bdb7-7cfc-4b60-8ba9-a33c3692bb85.png	2917bdb7-7cfc-4b60-8ba9-a33c3692bb85.png	\N	2026-04-01 00:41:59.256784+00	2026-04-01 00:41:59.256784+00	f	f	\N	\N	\N	STANDARD
e4b4f26c-dd65-47cc-ad69-d3d88ed240a9.png	e4b4f26c-dd65-47cc-ad69-d3d88ed240a9.png	\N	2026-04-01 00:42:03.417883+00	2026-04-01 00:42:03.417883+00	f	f	\N	\N	\N	STANDARD
faf71f86-dfb6-4850-aafe-8e1dcb6f09e9.png	faf71f86-dfb6-4850-aafe-8e1dcb6f09e9.png	\N	2026-04-01 00:42:54.026299+00	2026-04-01 00:42:54.026299+00	f	f	\N	\N	\N	STANDARD
26cede42-0c1e-492f-8a7a-3ea8dc69962f.png	26cede42-0c1e-492f-8a7a-3ea8dc69962f.png	\N	2026-04-09 23:22:49.837596+00	2026-04-09 23:22:49.837596+00	f	f	\N	\N	\N	STANDARD
9f403575-f760-4ab7-a474-bf791b9b415a.png	9f403575-f760-4ab7-a474-bf791b9b415a.png	\N	2026-04-09 23:23:02.954568+00	2026-04-09 23:23:02.954568+00	f	f	\N	\N	\N	STANDARD
76e2a42e-c679-4be6-84ae-8bf6cc7aef4d.jpeg	76e2a42e-c679-4be6-84ae-8bf6cc7aef4d.jpeg	\N	2026-04-17 00:38:56.365748+00	2026-04-17 00:38:56.365748+00	f	f	\N	\N	\N	STANDARD
70283f2e-1ea6-4a53-a355-74c52dd1c389.jpeg	70283f2e-1ea6-4a53-a355-74c52dd1c389.jpeg	\N	2026-04-17 00:40:43.179687+00	2026-04-17 00:40:43.179687+00	f	f	\N	\N	\N	STANDARD
413dc161-333a-4f6f-a6d3-78161bd7f8a0.jpeg	413dc161-333a-4f6f-a6d3-78161bd7f8a0.jpeg	\N	2026-04-17 01:02:18.852053+00	2026-04-17 01:02:18.852053+00	f	f	\N	\N	\N	STANDARD
549bc055-87bd-4a9e-aa44-d81505dcc11c.jpeg	549bc055-87bd-4a9e-aa44-d81505dcc11c.jpeg	\N	2026-04-17 01:02:56.37129+00	2026-04-17 01:02:56.37129+00	f	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_vectors" ("id", "type", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") FROM stdin;
eb018357-2aef-40ee-9716-ada464f51eb1	image	main-visual/20260226_193722_NETWORKING.png	\N	2026-02-27 00:37:26.191346+00	2026-02-27 00:37:26.191346+00	2026-02-27 00:37:26.191346+00	{"eTag": "\\"82e928ff5667497e27d505ff3db8f1e9\\"", "size": 16654, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-02-27T00:37:27.000Z", "contentLength": 16654, "httpStatusCode": 200}	949f3e8b-cabe-487d-8277-07e48aa44218	\N	{}
e40363de-d6f3-4be6-8423-9d8154d7d276	image	51e6efd3-38d8-4d85-9a39-b03a3ba01cbb.png	\N	2026-03-11 01:10:32.867206+00	2026-03-11 01:10:32.867206+00	2026-03-11 01:10:32.867206+00	{"eTag": "\\"1187b983a7a902ce53d356ee4bdc32a5\\"", "size": 581443, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-11T01:10:33.000Z", "contentLength": 581443, "httpStatusCode": 200}	189221e3-7bd8-4503-831f-3791721d06e1	\N	{}
435345b5-e685-4f5f-9039-e92f53ea58d1	image	main-visual/20260310_211037_Pasted_Graphic_1.png	\N	2026-03-11 01:10:38.412344+00	2026-03-11 01:10:38.412344+00	2026-03-11 01:10:38.412344+00	{"eTag": "\\"1187b983a7a902ce53d356ee4bdc32a5\\"", "size": 581443, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-11T01:10:39.000Z", "contentLength": 581443, "httpStatusCode": 200}	bc92e1c6-8d14-403e-abd7-fe9d54cbf80a	\N	{}
d8146b56-b26c-441d-bb60-6720fab670fb	document	911a285a-ea64-4d24-84b0-1c1ad72f392b.png	\N	2026-03-16 02:34:29.252535+00	2026-03-16 02:34:29.252535+00	2026-03-16 02:34:29.252535+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-16T02:34:30.000Z", "contentLength": 546697, "httpStatusCode": 200}	49b23177-2b74-4ee8-8b8b-e24c054870d7	\N	{}
ae9489a4-84c9-47ad-a95d-a9c08230a2b9	document	7b66a9f0-e62e-4fb5-890f-f7b796284e5f.png	\N	2026-03-16 02:34:30.539203+00	2026-03-16 02:34:30.539203+00	2026-03-16 02:34:30.539203+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-16T02:34:31.000Z", "contentLength": 546697, "httpStatusCode": 200}	562a5ec0-077b-4a5d-badb-87c813255e1b	\N	{}
3671045b-ad22-400d-a47a-19628d02eed2	document	05749cf7-51a8-4ef4-8fbb-112b60ef487f.png	\N	2026-03-27 00:43:20.700857+00	2026-03-27 00:43:20.700857+00	2026-03-27 00:43:20.700857+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-27T00:43:21.000Z", "contentLength": 546697, "httpStatusCode": 200}	a6f4751a-f375-42c4-ac98-517913e4cd56	\N	{}
417f5840-dd88-4ea7-a702-0115c4a7fe32	document	41fe5015-b678-4d0b-b99b-8b3e55deb022.png	\N	2026-03-27 00:43:23.571582+00	2026-03-27 00:43:23.571582+00	2026-03-27 00:43:23.571582+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-27T00:43:24.000Z", "contentLength": 546697, "httpStatusCode": 200}	521066d9-0bcf-4d1d-bf76-d78375b17092	\N	{}
8f69872c-5948-493b-8e90-fe80c6dd7da8	document	92f71e30-da78-44bb-8c3c-82f45633b198.jpg	\N	2026-04-03 01:30:09.478474+00	2026-04-03 01:30:09.478474+00	2026-04-03 01:30:09.478474+00	{"eTag": "\\"69eb9066da0c1527cc09fdd0c22ece77\\"", "size": 138883, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-03T01:30:10.000Z", "contentLength": 138883, "httpStatusCode": 200}	1bf346ee-b100-43c3-8407-3f86ff415c68	\N	{}
65fe3a68-34db-43da-adec-d07ba6435f84	document	b16eceb6-8fc2-485d-ae1c-aa58cef31e0a.pdf	\N	2026-04-03 01:30:26.339649+00	2026-04-03 01:30:26.339649+00	2026-04-03 01:30:26.339649+00	{"eTag": "\\"0e64d6ff10e1b76ce05570d07ecf32ac\\"", "size": 1594288, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2026-04-03T01:30:27.000Z", "contentLength": 1594288, "httpStatusCode": 200}	5f98da4e-28a7-4e58-b5e7-53371770f2c1	\N	{}
a6d81a07-3f27-4f52-97e7-cfd42786b527	document	95a355bf-5a6c-4e5c-af9b-c3d516616f40.png	\N	2026-04-03 01:32:16.798622+00	2026-04-03 01:32:16.798622+00	2026-04-03 01:32:16.798622+00	{"eTag": "\\"137e18785d4672efb111ba03b8374884\\"", "size": 521886, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-04-03T01:32:17.000Z", "contentLength": 521886, "httpStatusCode": 200}	94f19357-d270-4760-872a-2c7b53fc0410	\N	{}
39b38df9-9c5b-4e62-9cee-bb22deacf04d	document	0d96748e-58a6-4f46-8999-0dc8f665663a.png	\N	2026-04-03 18:39:31.062939+00	2026-04-03 18:39:31.062939+00	2026-04-03 18:39:31.062939+00	{"eTag": "\\"137e18785d4672efb111ba03b8374884\\"", "size": 521886, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-04-03T18:39:32.000Z", "contentLength": 521886, "httpStatusCode": 200}	9c4a9619-2582-4ece-ab84-14530793b561	\N	{}
001845d8-c2cf-476d-8caa-4fdf7491943e	image	main-visual/20260301_222423_test.jpeg	\N	2026-03-02 03:24:24.355321+00	2026-03-02 03:24:24.355321+00	2026-03-02 03:24:24.355321+00	{"eTag": "\\"a812788855535c2b7bb89deab02c1819\\"", "size": 11099, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-03-02T03:24:25.000Z", "contentLength": 11099, "httpStatusCode": 200}	5b18c8ff-dc0f-4971-838f-82ae88466dbe	\N	{}
c41cb26d-b8b0-4949-9ee7-d5950620534b	document	edb51981-3e96-4c3c-b7aa-7760e4cf5fb6.png	\N	2026-03-13 00:33:40.746642+00	2026-03-13 00:33:40.746642+00	2026-03-13 00:33:40.746642+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-13T00:33:41.000Z", "contentLength": 546697, "httpStatusCode": 200}	526a103b-e18c-48ab-892e-e330990feb42	\N	{}
c8a4c6ab-7aed-4de8-b637-e9684540d0ef	document	c125cbe1-84bc-4d93-94de-81c08750685b.png	\N	2026-03-13 00:33:42.372892+00	2026-03-13 00:33:42.372892+00	2026-03-13 00:33:42.372892+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-13T00:33:43.000Z", "contentLength": 546697, "httpStatusCode": 200}	156fd062-d0c0-49d6-8bc5-1b0dc0e7831c	\N	{}
65405c8a-ac36-48f7-bb9e-29086cd7d541	document	0af74a88-7f80-4dcb-b276-70c2ad0946f2.png	\N	2026-03-13 00:34:43.29808+00	2026-03-13 00:34:43.29808+00	2026-03-13 00:34:43.29808+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-13T00:34:44.000Z", "contentLength": 546697, "httpStatusCode": 200}	62554bf6-b7a0-4f46-ad39-6ac8819e0f50	\N	{}
2e81a6e8-6863-4e0e-9be6-4fb702d8f9b7	document	f6ed6be5-c44b-4223-a29b-e07f43708ffa.png	\N	2026-03-13 00:34:45.849284+00	2026-03-13 00:34:45.849284+00	2026-03-13 00:34:45.849284+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-13T00:34:46.000Z", "contentLength": 546697, "httpStatusCode": 200}	b94acb77-2305-419f-ae3c-06f05b421de2	\N	{}
bd7010ba-f6fd-4ff6-8fce-da0ec1fc385f	document	ea076e8a-ab1a-4511-9496-63083c586c48.png	\N	2026-03-13 00:37:59.384076+00	2026-03-13 00:37:59.384076+00	2026-03-13 00:37:59.384076+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-13T00:38:00.000Z", "contentLength": 546697, "httpStatusCode": 200}	b000c70f-a966-4c2c-aaf0-f44adc925b1d	\N	{}
d1eb1c98-6baf-4e9c-9190-618f8e7672ee	document	6eb65059-7e27-4952-9473-1ca31300ea82.png	\N	2026-03-13 00:38:01.21855+00	2026-03-13 00:38:01.21855+00	2026-03-13 00:38:01.21855+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-13T00:38:02.000Z", "contentLength": 546697, "httpStatusCode": 200}	2a9e0105-594e-49f3-acb3-79e400589fbf	\N	{}
f9940af0-b5e1-4274-b872-217465462806	document	686cdcd3-47ca-461e-838a-c56c9fce8d29.png	\N	2026-03-23 01:03:17.485853+00	2026-03-23 01:03:17.485853+00	2026-03-23 01:03:17.485853+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-23T01:03:18.000Z", "contentLength": 546697, "httpStatusCode": 200}	55d9dea2-d070-41f5-8fec-f43a591f6818	\N	{}
4a553ddd-8a30-47aa-94cb-7f64c2fb96ea	document	193b3d5e-6ad7-451e-b6d1-f1d4464c4d44.png	\N	2026-03-23 01:03:22.128874+00	2026-03-23 01:03:22.128874+00	2026-03-23 01:03:22.128874+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-23T01:03:23.000Z", "contentLength": 546697, "httpStatusCode": 200}	eaf78900-7062-41b5-97b7-e8682898a0c6	\N	{}
7eaa3926-ff8e-4620-9fd0-b3286a7657be	document	0489b5c7-3b40-4358-9b51-36316fcaf9c2.jpg	\N	2026-03-27 04:42:28.217913+00	2026-03-27 04:42:28.217913+00	2026-03-27 04:42:28.217913+00	{"eTag": "\\"69eb9066da0c1527cc09fdd0c22ece77\\"", "size": 138883, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-03-27T04:42:29.000Z", "contentLength": 138883, "httpStatusCode": 200}	184203dc-1a7b-421a-baf3-1c182c071e9b	\N	{}
11861045-403e-4e17-8765-ddf0c9eb6519	document	de5f77b4-f3d5-4954-ba02-c9cf0e8fd51a.jpg	\N	2026-03-27 04:42:31.411665+00	2026-03-27 04:42:31.411665+00	2026-03-27 04:42:31.411665+00	{"eTag": "\\"69eb9066da0c1527cc09fdd0c22ece77\\"", "size": 138883, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-03-27T04:42:32.000Z", "contentLength": 138883, "httpStatusCode": 200}	ded64fa2-b8cb-4db3-82ca-ce9391ae035a	\N	{}
e47c85ca-298e-4635-9e20-af6f7dffd026	document	ebooks/87320a2a-3d56-43ec-98a7-ac87c0172150.pdf	\N	2026-03-03 04:40:14.665816+00	2026-03-03 04:40:14.665816+00	2026-03-03 04:40:14.665816+00	{"eTag": "\\"12bccc56b13f23d645c641df96789813-2\\"", "size": 5284297, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2026-03-03T04:40:15.000Z", "contentLength": 5284297, "httpStatusCode": 200}	2d1fced0-a205-4a93-9e66-1d07c6308fdc	\N	{}
859596c1-9f47-4b21-96c1-bd31e4a200b5	document	ebooks/0304be97-859c-4ac5-bee3-4f8d6e650896.png	\N	2026-03-03 04:46:29.092649+00	2026-03-03 04:46:29.092649+00	2026-03-03 04:46:29.092649+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-03T04:46:30.000Z", "contentLength": 546697, "httpStatusCode": 200}	92a62251-1e21-4791-ac20-98d59ff1f9e8	\N	{}
102f169b-4930-4eb2-b636-b36187617c44	document	ebooks/bd460ff3-5351-4fb6-8b3b-6f1370862f94.png	\N	2026-03-03 04:46:44.341001+00	2026-03-03 04:46:44.341001+00	2026-03-03 04:46:44.341001+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-03T04:46:45.000Z", "contentLength": 546697, "httpStatusCode": 200}	9b89c1d7-774a-4315-8425-d24e8f6b403b	\N	{}
db7ece60-7172-4efd-967c-f66567579cae	document	ebooks/70ae8c6c-8159-464d-a02e-0dfe959a7af2.pdf	\N	2026-03-03 04:46:56.863561+00	2026-03-03 04:46:56.863561+00	2026-03-03 04:46:56.863561+00	{"eTag": "\\"12bccc56b13f23d645c641df96789813-2\\"", "size": 5284297, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2026-03-03T04:46:57.000Z", "contentLength": 5284297, "httpStatusCode": 200}	8de4d098-c383-4ff7-a3ea-8b6afae90d6a	\N	{}
efd2a953-3787-412a-ab4b-7318e97c39c4	document	ebooks/e102d4e2-aa23-41f5-82a6-2c2916e4b2dc.pdf	\N	2026-03-03 04:47:14.016144+00	2026-03-03 04:47:14.016144+00	2026-03-03 04:47:14.016144+00	{"eTag": "\\"12bccc56b13f23d645c641df96789813-2\\"", "size": 5284297, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2026-03-03T04:47:14.000Z", "contentLength": 5284297, "httpStatusCode": 200}	24769ea6-8a96-4b1b-844c-a6dd302a3e57	\N	{}
96f465f3-d7a2-490c-8b9a-38c602bb7257	document	ebooks/9fd52885-ec36-4099-9732-58e86e3348a0.png	\N	2026-03-03 04:55:17.746649+00	2026-03-03 04:55:17.746649+00	2026-03-03 04:55:17.746649+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-03T04:55:18.000Z", "contentLength": 546697, "httpStatusCode": 200}	03318e71-8213-442d-b4d6-41a86ab1f953	\N	{}
00fe785f-ea10-45de-8634-872c43bf193e	document	ebooks/4a480b18-29e7-4646-8406-5dd5a3496d46.png	\N	2026-03-03 04:57:21.860275+00	2026-03-03 04:57:21.860275+00	2026-03-03 04:57:21.860275+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-03T04:57:22.000Z", "contentLength": 546697, "httpStatusCode": 200}	c452bec9-e638-4ec1-95d1-e9c9b617705a	\N	{}
58a5acfa-239b-4f5c-b553-ad48e2271f3e	document	ebooks/f84e4d8f-7b72-41cb-b00a-d8caea8ae4a5.png	\N	2026-03-03 04:57:46.966816+00	2026-03-03 04:57:46.966816+00	2026-03-03 04:57:46.966816+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-03T04:57:47.000Z", "contentLength": 546697, "httpStatusCode": 200}	cab6c6fa-956f-493b-b5a1-88f6590fd88e	\N	{}
b64cc648-225e-4fcc-9b63-e8fa6fc0b470	document	ebooks/c54fce71-1c9f-4410-b558-359183d398e1.png	\N	2026-03-03 05:00:57.626523+00	2026-03-03 05:00:57.626523+00	2026-03-03 05:00:57.626523+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-03T05:00:58.000Z", "contentLength": 546697, "httpStatusCode": 200}	be5bf37c-b57b-4ba5-918d-c184be156b8d	\N	{}
ce825daa-7a01-4a35-bb09-7e25892cf4a5	document	ebooks/1fd8f1ad-d806-474d-acf6-9f244b937616.png	\N	2026-03-03 05:01:32.161564+00	2026-03-03 05:01:32.161564+00	2026-03-03 05:01:32.161564+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-03T05:01:33.000Z", "contentLength": 546697, "httpStatusCode": 200}	8620fe19-4a78-4377-960c-07b516d5819c	\N	{}
95e33a27-a40e-48e2-91c6-cb18cc5daa32	document	ebooks/43361250-ea5a-48fd-8835-d854371c9750.png	\N	2026-03-03 05:03:01.962315+00	2026-03-03 05:03:01.962315+00	2026-03-03 05:03:01.962315+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-03T05:03:02.000Z", "contentLength": 546697, "httpStatusCode": 200}	8af22213-114e-4124-9925-6a78eedabc2f	\N	{}
e02628e8-64e5-40aa-870c-f0b3a9ec79ef	image	cac1129f-39cf-4366-9428-483e4f984494.png	\N	2025-08-03 15:53:54.50804+00	2025-08-21 14:55:01.362004+00	2025-08-03 15:53:54.50804+00	{"eTag": "\\"8c12cde5c0cada217e85dac1694f46ae\\"", "size": 119980, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-03T15:53:55.000Z", "contentLength": 119980, "httpStatusCode": 200}	fac8493a-2927-45f6-b3c6-6e22247aba7a	\N	{}
0348ddb4-f3b8-4508-b3cb-0fa1933e3111	document	ebooks/6e0dba23-29d3-4434-a881-d7993e5df4ae.png	\N	2026-03-05 01:46:40.230679+00	2026-03-05 01:46:40.230679+00	2026-03-05 01:46:40.230679+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-05T01:46:41.000Z", "contentLength": 546697, "httpStatusCode": 200}	d12570fa-9f39-451d-aa73-0f240e66bf13	\N	{}
2d96bac3-08fb-4a5d-a4d9-de7b86a8adcf	document	ebooks/22b1a452-af77-4f8c-aff8-e58bfc40dc59.png	\N	2026-03-05 01:46:41.450397+00	2026-03-05 01:46:41.450397+00	2026-03-05 01:46:41.450397+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-05T01:46:42.000Z", "contentLength": 546697, "httpStatusCode": 200}	df6a588c-12be-4797-8761-4961c923fd46	\N	{}
b20c0681-c4bf-4046-bba3-459dbc969643	document	78764613-d361-4ace-8c82-3ba3c474bfea.png	\N	2026-03-13 01:27:04.467524+00	2026-03-13 01:27:04.467524+00	2026-03-13 01:27:04.467524+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-13T01:27:05.000Z", "contentLength": 546697, "httpStatusCode": 200}	49d84c4f-c63d-488d-a2c8-d51d7cc625e8	\N	{}
16b64e30-0662-4aae-8e58-6b2e81be658d	document	ff87f4f2-642c-497c-98bc-6de5859d28b7.png	\N	2026-03-13 01:27:07.042381+00	2026-03-13 01:27:07.042381+00	2026-03-13 01:27:07.042381+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-13T01:27:07.000Z", "contentLength": 546697, "httpStatusCode": 200}	ad2ec5a2-0764-4fa2-9e14-f6a2e946f282	\N	{}
d8398e8f-a3ec-41df-baa6-aedd0cd01ac8	document	ab97ab11-0c9d-43c8-a0e5-0b29be3b313d.png	\N	2026-03-24 02:38:26.469908+00	2026-03-24 02:38:26.469908+00	2026-03-24 02:38:26.469908+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-24T02:38:27.000Z", "contentLength": 546697, "httpStatusCode": 200}	a53e74d3-6540-435e-a3c4-8783f0a97fe6	\N	{}
d0afe915-ed73-44f6-b732-ff9d7156afe7	document	6bba3dd7-a7da-4672-a1b4-fbaed90cd158.png	\N	2026-03-24 02:38:28.699302+00	2026-03-24 02:38:28.699302+00	2026-03-24 02:38:28.699302+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-24T02:38:29.000Z", "contentLength": 546697, "httpStatusCode": 200}	0eb61b79-e67e-4832-9223-0b191a686ac4	\N	{}
5b245c4a-7657-45a0-b39a-bfb6e7badebc	document	af3af5d0-e813-47c7-824d-7a3e076bbf0a.png	\N	2026-03-24 02:39:20.365938+00	2026-03-24 02:39:20.365938+00	2026-03-24 02:39:20.365938+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-24T02:39:21.000Z", "contentLength": 546697, "httpStatusCode": 200}	5d6f2e0d-4ee7-4821-94d4-a87a7c122f35	\N	{}
1acffdff-9474-4e7b-8830-8b616b0959df	document	9290234d-7df5-45e3-9386-1676ecfcd1cc.png	\N	2026-03-24 02:39:23.04563+00	2026-03-24 02:39:23.04563+00	2026-03-24 02:39:23.04563+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-24T02:39:24.000Z", "contentLength": 546697, "httpStatusCode": 200}	eca352d7-e2fc-45c7-92f3-1b80e65e8e61	\N	{}
da625702-ad37-48c9-955a-5f9ce306e0a6	document	e267539b-003e-4e6e-a129-3f184fc20775.jpg	\N	2026-04-03 01:09:18.97056+00	2026-04-03 01:09:18.97056+00	2026-04-03 01:09:18.97056+00	{"eTag": "\\"69eb9066da0c1527cc09fdd0c22ece77\\"", "size": 138883, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-03T01:09:19.000Z", "contentLength": 138883, "httpStatusCode": 200}	9dec05e3-9a5e-4f49-ab62-9e0a6895ee48	\N	{}
90fbc712-d89d-4248-98e9-a7eb4b637e00	document	110dc6b5-5a3d-4de9-86ec-3e4bd84666df.jpg	\N	2026-04-03 01:09:30.162946+00	2026-04-03 01:09:30.162946+00	2026-04-03 01:09:30.162946+00	{"eTag": "\\"dff9c01d18434b84c58a7d83467a5084\\"", "size": 86198, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-03T01:09:31.000Z", "contentLength": 86198, "httpStatusCode": 200}	946895c9-1e58-462d-8088-748861bc1d4f	\N	{}
db0065ef-8faa-41d6-9c29-829d3061572a	document	d7a8fdbf-6e18-4a3b-8f89-1af3eaf4a103.pdf	\N	2026-04-03 01:09:46.333+00	2026-04-03 01:09:46.333+00	2026-04-03 01:09:46.333+00	{"eTag": "\\"0e64d6ff10e1b76ce05570d07ecf32ac\\"", "size": 1594288, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2026-04-03T01:09:47.000Z", "contentLength": 1594288, "httpStatusCode": 200}	9fe3f45a-73fe-4fed-a3e7-3fdeda2413e4	\N	{}
a114a220-8c44-4c1a-b689-e3488e1c211f	document	ebooks/a6fc2466-3a8c-4e7d-8100-4fa5c6e1be38.png	\N	2026-03-05 02:03:47.018787+00	2026-03-05 02:03:47.018787+00	2026-03-05 02:03:47.018787+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-05T02:03:47.000Z", "contentLength": 546697, "httpStatusCode": 200}	ad00d0e0-0649-4443-9cd9-c72c0205bd5a	\N	{}
7e103e7d-2bc6-4acf-92e4-cdcfe265f34a	document	262caacb-429e-4271-a940-32d1ea551574.png	\N	2026-03-16 02:18:18.915155+00	2026-03-16 02:18:18.915155+00	2026-03-16 02:18:18.915155+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-16T02:18:19.000Z", "contentLength": 546697, "httpStatusCode": 200}	4e17973a-ff09-4f2d-a8f0-4447ecab6817	\N	{}
23737374-3e5c-4cda-923b-35c2746e313f	document	ee8d4438-4f4e-4143-950d-3eb4825627bb.png	\N	2026-03-16 02:18:20.109462+00	2026-03-16 02:18:20.109462+00	2026-03-16 02:18:20.109462+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-16T02:18:21.000Z", "contentLength": 546697, "httpStatusCode": 200}	ab686870-9375-4ccb-9628-114a76dbec69	\N	{}
4cd26bc1-a96b-4444-a6f8-b118dad005b2	document	381f5565-4cc1-42fa-8ec0-9b47467bfe56.png	\N	2026-03-24 02:53:39.639281+00	2026-03-24 02:53:39.639281+00	2026-03-24 02:53:39.639281+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-24T02:53:40.000Z", "contentLength": 546697, "httpStatusCode": 200}	8dd67b4b-b5e9-45ea-9e2c-47d176215c05	\N	{}
49d44bf1-efc0-4491-b772-651840643c54	document	2440e14b-af8f-4156-91ff-268a50bd2111.png	\N	2026-03-24 02:53:40.814026+00	2026-03-24 02:53:40.814026+00	2026-03-24 02:53:40.814026+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-24T02:53:41.000Z", "contentLength": 546697, "httpStatusCode": 200}	383ce286-3b31-4ee1-a950-f71731922c17	\N	{}
3019c6f8-ae11-4d70-98b7-8dd737936c69	document	6e6c4c6d-626e-4637-b841-2677e21eab45.jpg	\N	2026-04-03 01:10:36.365952+00	2026-04-03 01:10:36.365952+00	2026-04-03 01:10:36.365952+00	{"eTag": "\\"dff9c01d18434b84c58a7d83467a5084\\"", "size": 86198, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-03T01:10:37.000Z", "contentLength": 86198, "httpStatusCode": 200}	5bd6c830-723a-4b02-a9a4-e13111f72323	\N	{}
b80c5032-03c2-4ed4-a046-a48445ae85af	document	4dee4666-8c1f-4bcf-af52-e10ecc294679.png	\N	2026-04-03 01:13:11.537325+00	2026-04-03 01:13:11.537325+00	2026-04-03 01:13:11.537325+00	{"eTag": "\\"429196cf31230bcf2b126e89c40b8c66\\"", "size": 209064, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-04-03T01:13:12.000Z", "contentLength": 209064, "httpStatusCode": 200}	f1e207ff-ceee-417e-93f3-54e9adb0969b	\N	{}
c0ce8a26-15d1-4505-ae44-46aca77028a6	document	53d95372-1cbb-447e-b90b-98c7b857638f.png	\N	2026-04-03 17:11:55.883261+00	2026-04-03 17:11:55.883261+00	2026-04-03 17:11:55.883261+00	{"eTag": "\\"29c3baddfbdc39541617a188f6c3ba82\\"", "size": 436916, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-04-03T17:11:56.000Z", "contentLength": 436916, "httpStatusCode": 200}	ee34cb6a-e855-4730-bacb-167268ac3faf	\N	{}
0b982b25-94b6-45e6-aa6c-bf3f348f72f2	document	08024eb4-12ce-483e-9e86-03adb7afdd6d.png	\N	2026-04-03 17:12:03.185276+00	2026-04-03 17:12:03.185276+00	2026-04-03 17:12:03.185276+00	{"eTag": "\\"429196cf31230bcf2b126e89c40b8c66\\"", "size": 209064, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-04-03T17:12:04.000Z", "contentLength": 209064, "httpStatusCode": 200}	b8dd838a-5ad7-476f-9239-d2c50f2964ef	\N	{}
746df014-7499-4821-ad57-dbcce3b66e33	document	.emptyFolderPlaceholder	\N	2025-04-02 04:52:09.782119+00	2025-08-21 14:55:01.362004+00	2025-04-02 04:52:09.782119+00	{"eTag": "\\"d41d8cd98f00b204e9800998ecf8427e\\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-02T04:52:10.000Z", "contentLength": 0, "httpStatusCode": 200}	d8b84b22-af5f-4025-ade6-3a834921f017	\N	{}
5ba37d2f-743f-415a-b7b3-3179d140498f	image	02e9ae62-6060-481b-9892-d045de677d29.png	\N	2025-08-01 01:29:37.465346+00	2025-08-21 14:55:01.362004+00	2025-08-01 01:29:37.465346+00	{"eTag": "\\"85d0718a3ca08240bb80a10776e1b8e7\\"", "size": 155752, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T01:29:38.000Z", "contentLength": 155752, "httpStatusCode": 200}	285e173f-f5ac-4edf-8d17-70766dd099b0	\N	{}
6f58ee34-ea0c-4cd0-95cd-c613244f0d24	image	101f331c-527d-4b32-bd1e-6d57093a6ae6.png	\N	2025-08-08 01:48:36.069314+00	2025-08-21 14:55:01.362004+00	2025-08-08 01:48:36.069314+00	{"eTag": "\\"6cb75f1b888feda44c7108d04ea5db65\\"", "size": 219939, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-08T01:48:37.000Z", "contentLength": 219939, "httpStatusCode": 200}	ce3051e6-2ae8-46e1-8e42-15bf86b9a105	\N	{}
0e05015e-0c83-49a4-9ff2-90a7b1117884	image	103be76a-ad40-4262-bee9-c2141925e910.png	\N	2025-08-01 01:41:29.086605+00	2025-08-21 14:55:01.362004+00	2025-08-01 01:41:29.086605+00	{"eTag": "\\"6cb75f1b888feda44c7108d04ea5db65\\"", "size": 219939, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T01:41:30.000Z", "contentLength": 219939, "httpStatusCode": 200}	95acce6f-0475-482e-a6c2-d67b85800eef	\N	{}
cc4ea338-9a21-476c-a24a-9a361efd1f13	image	15970336-17c1-42e8-aaa0-03ce4294cd14.png	\N	2025-07-25 00:50:47.174027+00	2025-08-21 14:55:01.362004+00	2025-07-25 00:50:47.174027+00	{"eTag": "\\"6cb75f1b888feda44c7108d04ea5db65\\"", "size": 219939, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-07-25T00:50:48.000Z", "contentLength": 219939, "httpStatusCode": 200}	95870a1f-15d0-4ae2-96ad-5b9f4d7bd439	\N	{}
dc20dd47-ac3f-48f1-8135-c92829456641	image	15a4d5c7-22d7-4df0-b3f2-fa7a544e9f10.png	\N	2025-08-01 01:08:44.190653+00	2025-08-21 14:55:01.362004+00	2025-08-01 01:08:44.190653+00	{"eTag": "\\"e0b5bd00590a90818853faa661060227\\"", "size": 199106, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T01:08:45.000Z", "contentLength": 199106, "httpStatusCode": 200}	4408246d-b098-47e1-9a73-c04b81cda267	\N	{}
3cfafddd-c226-4340-a4bc-516a1444beb9	image	1ed1fda0-62ea-4777-806a-2dd2c9bb5c27.png	\N	2025-07-25 00:54:26.634288+00	2025-08-21 14:55:01.362004+00	2025-07-25 00:54:26.634288+00	{"eTag": "\\"8c12cde5c0cada217e85dac1694f46ae\\"", "size": 119980, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-07-25T00:54:27.000Z", "contentLength": 119980, "httpStatusCode": 200}	c0dcf02f-ac4a-4464-bb9d-b99151d3f56e	\N	{}
21025910-25a5-44c8-913d-9fac8c7b9c04	image	2305702b-de1c-4f63-acea-8c0f264c1c11.png	\N	2025-08-01 01:43:50.288308+00	2025-08-21 14:55:01.362004+00	2025-08-01 01:43:50.288308+00	{"eTag": "\\"6cb75f1b888feda44c7108d04ea5db65\\"", "size": 219939, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T01:43:51.000Z", "contentLength": 219939, "httpStatusCode": 200}	61421c06-4c2b-44dd-8059-f960701bc65e	\N	{}
4aee3f5d-323d-4f2d-8f17-48429cd15b3c	document	26test - 255626 18:56:25	\N	2025-05-26 22:56:25.439009+00	2025-08-21 14:55:01.362004+00	2025-05-26 22:56:25.439009+00	{"eTag": "\\"1e90de81b375b79200f4982585159164\\"", "size": 36175, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-26T22:56:26.000Z", "contentLength": 36175, "httpStatusCode": 200}	f0c63788-0fda-4008-8227-b4ce31b5e23d	\N	{}
f893d244-86d0-410d-be6d-9420e5100661	image	3bb482cb-e904-4e3d-b287-b264aa8a3999.png	\N	2025-08-01 00:44:34.697905+00	2025-08-21 14:55:01.362004+00	2025-08-01 00:44:34.697905+00	{"eTag": "\\"05020197452b31b8f4ba63b05f28ef36\\"", "size": 221977, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T00:44:35.000Z", "contentLength": 221977, "httpStatusCode": 200}	6552b356-8145-4fb5-8c57-89c8fe80c9a7	\N	{}
d11a2390-2912-4543-81b2-a1b8221161a2	image	3feda491-85a8-4a84-b320-508ab5183285.png	\N	2025-08-01 00:34:42.62908+00	2025-08-21 14:55:01.362004+00	2025-08-01 00:34:42.62908+00	{"eTag": "\\"85d0718a3ca08240bb80a10776e1b8e7\\"", "size": 155752, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T00:34:43.000Z", "contentLength": 155752, "httpStatusCode": 200}	ce76a831-134f-4830-a265-406877e2a00f	\N	{}
75d2e029-12dc-44ff-8b1d-8ce8b4d4d880	image	4258f93a-3ec1-4a2f-a1f3-d7edd1c7c69c.png	\N	2025-08-01 01:43:02.203509+00	2025-08-21 14:55:01.362004+00	2025-08-01 01:43:02.203509+00	{"eTag": "\\"6cb75f1b888feda44c7108d04ea5db65\\"", "size": 219939, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T01:43:03.000Z", "contentLength": 219939, "httpStatusCode": 200}	6342c3d5-0094-4a34-994e-1b54fb90bde7	\N	{}
e8132f94-d054-4a8c-a931-300dbdedd379	image	4343540c-aeff-49e7-8aa6-3b7d1c436c68.png	\N	2025-08-01 01:24:45.538024+00	2025-08-21 14:55:01.362004+00	2025-08-01 01:24:45.538024+00	{"eTag": "\\"e0b5bd00590a90818853faa661060227\\"", "size": 199106, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T01:24:46.000Z", "contentLength": 199106, "httpStatusCode": 200}	ed4b2adc-039e-427d-9489-8b76ceae82c0	\N	{}
2fbe88ed-9447-43f9-82ca-b2652164e600	image	502be9ee-af7f-4f83-9560-0a3acf911f08.png	\N	2025-08-01 00:45:50.692391+00	2025-08-21 14:55:01.362004+00	2025-08-01 00:45:50.692391+00	{"eTag": "\\"081ba84b6157c66fe545b95afcc77921\\"", "size": 10972, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T00:45:51.000Z", "contentLength": 10972, "httpStatusCode": 200}	368d74ba-aadd-48fa-baad-c79a101ca283	\N	{}
ebc71a2f-8951-43ab-9beb-371ce5cd14a7	image	546166d5-a9ec-4cf1-8a77-f70575c97f12.png	\N	2025-08-05 23:09:29.99799+00	2025-08-21 14:55:01.362004+00	2025-08-05 23:09:29.99799+00	{"eTag": "\\"e0b5bd00590a90818853faa661060227\\"", "size": 199106, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-05T23:09:30.000Z", "contentLength": 199106, "httpStatusCode": 200}	3b093873-6bf4-4d9e-8d39-41d13745e2e8	\N	{}
31edb49d-a7ee-42e3-991d-f4fe5decd3d4	image	5a358b9c-34c5-472f-aa3d-665e9f341a7a.jpeg	\N	2025-08-01 00:14:47.329117+00	2025-08-21 14:55:01.362004+00	2025-08-01 00:14:47.329117+00	{"eTag": "\\"cb12b5bbb09d4b32119acf4bc6c7ac3f\\"", "size": 11481, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-08-01T00:14:48.000Z", "contentLength": 11481, "httpStatusCode": 200}	47a77616-36fa-4a18-b364-fc7815cbaa7e	\N	{}
08c3c93e-e02f-42d8-9c44-0ede119d692f	image	5b4d20a3-e3e3-403e-9f67-1ce371efd92f.svg	\N	2025-07-25 01:12:28.044188+00	2025-08-21 14:55:01.362004+00	2025-07-25 01:12:28.044188+00	{"eTag": "\\"4ea42bb724d1b83df2d2618d056d3a83\\"", "size": 36554, "mimetype": "image/svg+xml", "cacheControl": "no-cache", "lastModified": "2025-07-25T01:12:28.000Z", "contentLength": 36554, "httpStatusCode": 200}	e66a599f-9ff8-4ba9-9972-6b2741fc1ad5	\N	{}
edf977e1-882b-4377-8378-150fb334c505	image	5c07e0b3-ebda-4471-bbf4-5bf4511e6c52.png	\N	2025-08-03 16:29:36.650956+00	2025-08-21 14:55:01.362004+00	2025-08-03 16:29:36.650956+00	{"eTag": "\\"e0b5bd00590a90818853faa661060227\\"", "size": 199106, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-03T16:29:37.000Z", "contentLength": 199106, "httpStatusCode": 200}	d43e4dd5-253a-44e2-ad9c-cd7a9f6303c0	\N	{}
13a8ee88-3df2-467b-ac5e-b0e6b644397c	image	5c963cda-212f-4649-8c92-9dbf45e31c6f.jpeg	\N	2025-08-07 22:32:53.225989+00	2025-08-21 14:55:01.362004+00	2025-08-07 22:32:53.225989+00	{"eTag": "\\"8dd3e2981f09cfc37b042e4919455662\\"", "size": 8263, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-08-07T22:32:54.000Z", "contentLength": 8263, "httpStatusCode": 200}	7655443b-3527-4b5e-93d0-26d09b638581	\N	{}
d9ca0b8d-76fe-437a-be48-22166d99611c	image	667c6cc1-532f-4db8-a896-1d810bcabd35.png	\N	2025-08-03 15:52:43.621382+00	2025-08-21 14:55:01.362004+00	2025-08-03 15:52:43.621382+00	{"eTag": "\\"1c10a26bf925ba1401a391ec62cc93dd\\"", "size": 147635, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-03T15:52:44.000Z", "contentLength": 147635, "httpStatusCode": 200}	f120e74b-b104-4cbe-8193-cd916328d30a	\N	{}
d8a73fb1-ba23-4de3-9e9d-06127bc4f91c	image	6ea853f4-3917-4a57-9428-45621081d2ee.png	\N	2025-08-03 15:50:29.674364+00	2025-08-21 14:55:01.362004+00	2025-08-03 15:50:29.674364+00	{"eTag": "\\"6cb75f1b888feda44c7108d04ea5db65\\"", "size": 219939, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-03T15:50:30.000Z", "contentLength": 219939, "httpStatusCode": 200}	845ee128-767c-4d7a-858c-c35ab00c178f	\N	{}
fe028926-ffd7-4749-8070-f619729e0404	image	7286debb-eb94-4a9b-9a83-98e858219d08.png	\N	2025-08-05 23:13:29.693969+00	2025-08-21 14:55:01.362004+00	2025-08-05 23:13:29.693969+00	{"eTag": "\\"e0b5bd00590a90818853faa661060227\\"", "size": 199106, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-05T23:13:30.000Z", "contentLength": 199106, "httpStatusCode": 200}	c2a979d7-7c3f-4475-9520-19009d0f276c	\N	{}
8b16fca6-8c7f-4489-a495-fc324914996d	image	78a8d326-c62e-4954-abfe-760b2369a615.png	\N	2025-08-01 01:45:22.515108+00	2025-08-21 14:55:01.362004+00	2025-08-01 01:45:22.515108+00	{"eTag": "\\"6cb75f1b888feda44c7108d04ea5db65\\"", "size": 219939, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T01:45:23.000Z", "contentLength": 219939, "httpStatusCode": 200}	48b99233-4438-4d91-9373-f7f048b94052	\N	{}
e5ff8d3a-5c15-45f2-827f-c5f17b6e9731	image	7bdbad87-f0a1-4a82-9ff2-3983fe820d13.jpeg	\N	2025-08-07 22:36:00.647912+00	2025-08-21 14:55:01.362004+00	2025-08-07 22:36:00.647912+00	{"eTag": "\\"63ac10dc7eba4d0617267832221d22bd\\"", "size": 6417, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-08-07T22:36:01.000Z", "contentLength": 6417, "httpStatusCode": 200}	1e36e883-e3d3-43b7-b1b8-0264cd51c418	\N	{}
6d0df677-9050-4822-a19e-5814aefb78ee	image	811495af-8968-4533-bd30-4a00b309318a.png	\N	2025-08-03 15:51:55.206722+00	2025-08-21 14:55:01.362004+00	2025-08-03 15:51:55.206722+00	{"eTag": "\\"8c12cde5c0cada217e85dac1694f46ae\\"", "size": 119980, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-03T15:51:56.000Z", "contentLength": 119980, "httpStatusCode": 200}	28d25b7f-06a4-4bc9-8a8c-5045f5a833a6	\N	{}
74fcdcde-63c1-4096-acaa-f8a00fbbc723	document	838331e8-af7a-43ac-bca5-08d70a0eb069.pdf	\N	2025-05-10 19:55:20.813051+00	2025-08-21 14:55:01.362004+00	2025-05-10 19:55:20.813051+00	{"eTag": "\\"1e90de81b375b79200f4982585159164\\"", "size": 36175, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-10T19:55:21.000Z", "contentLength": 36175, "httpStatusCode": 200}	5a1f03b9-e247-44ac-ae64-1a22890bc188	\N	{}
2ccf140b-4e18-4fdf-bb32-a5072c32dece	image	84fd08e5-c4f9-4052-9cfb-9201f91277fc.png	\N	2025-08-05 23:11:43.06852+00	2025-08-21 14:55:01.362004+00	2025-08-05 23:11:43.06852+00	{"eTag": "\\"e0b5bd00590a90818853faa661060227\\"", "size": 199106, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-05T23:11:43.000Z", "contentLength": 199106, "httpStatusCode": 200}	ad5c2e2b-081f-47ed-a7b1-0d0004a7f794	\N	{}
969cc0c1-d0fe-4d3d-86c1-642e31f60a7e	image	85cc43e6-5c7d-422a-8111-7dbdd6a258fc.png	\N	2025-08-01 00:24:06.673849+00	2025-08-21 14:55:01.362004+00	2025-08-01 00:24:06.673849+00	{"eTag": "\\"249b1740c96d23af3c255191e6121f30\\"", "size": 138373, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T00:24:07.000Z", "contentLength": 138373, "httpStatusCode": 200}	516ef9ca-fda6-4216-ae1d-cd7f561bc181	\N	{}
e5b58ce2-0e07-4d95-b055-dda1d35ee407	image	8ea1e923-33d9-4a6e-b28f-cc4af6de0d4d.png	\N	2025-08-01 01:09:51.321118+00	2025-08-21 14:55:01.362004+00	2025-08-01 01:09:51.321118+00	{"eTag": "\\"85d0718a3ca08240bb80a10776e1b8e7\\"", "size": 155752, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T01:09:52.000Z", "contentLength": 155752, "httpStatusCode": 200}	6912c8e9-9b0c-42da-bc62-9db0b4c1f7bb	\N	{}
7548bd78-9a1a-4a83-b85f-5dc94468391a	document	903f34d2-7a67-4942-ac52-79686df65118.pdf	\N	2025-05-16 00:21:53.132058+00	2025-08-21 14:55:01.362004+00	2025-05-16 00:21:53.132058+00	{"eTag": "\\"1e90de81b375b79200f4982585159164\\"", "size": 36175, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-16T00:21:54.000Z", "contentLength": 36175, "httpStatusCode": 200}	4f577b70-aca7-4a13-a92d-c7d2e837ee8c	\N	{}
9e10dfdb-0e57-4084-8931-66f194a1f6c6	document	Celpip_template.pdf	\N	2025-04-02 04:52:39.939958+00	2025-08-21 14:55:01.362004+00	2025-04-02 04:52:39.939958+00	{"eTag": "\\"8073f116e041c1824b501df28a8b098a\\"", "size": 73820, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-04-02T04:52:40.000Z", "contentLength": 73820, "httpStatusCode": 200}	a4022fed-ba06-40c0-827e-d2d422fdeb58	\N	{}
9d402464-a4c9-4f2d-ad2f-3c1dd5d9d704	document	Sample.pdf	\N	2025-04-02 04:53:06.844829+00	2025-08-21 14:55:01.362004+00	2025-04-02 04:53:06.844829+00	{"eTag": "\\"1e90de81b375b79200f4982585159164\\"", "size": 36175, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-04-02T04:53:07.000Z", "contentLength": 36175, "httpStatusCode": 200}	a498fb98-34fd-4d46-9ebf-d330b5acf298	\N	{}
f1bafc52-7732-4582-89e2-67be3c0964e2	document	TEST_2025052603 - 254926 16:49:24	\N	2025-05-26 22:49:29.673957+00	2025-08-21 14:55:01.362004+00	2025-05-26 22:49:29.673957+00	{"eTag": "\\"6342e2ad101ad411e07ce2d0b5527cbc\\"", "size": 780787, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-26T22:49:30.000Z", "contentLength": 780787, "httpStatusCode": 200}	4a08c6b1-c56a-479a-8481-eae26b96cc5b	\N	{}
358ad6cb-0a8a-4786-b0c4-2a6e98bcddbd	document	TEST_2025052603 - 254926 16:49:30	\N	2025-05-26 22:49:34.848197+00	2025-08-21 14:55:01.362004+00	2025-05-26 22:49:34.848197+00	{"eTag": "\\"6342e2ad101ad411e07ce2d0b5527cbc\\"", "size": 780787, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-26T22:49:35.000Z", "contentLength": 780787, "httpStatusCode": 200}	c1dfe1ef-ea65-4bc9-8335-a1d508274a61	\N	{}
e35cc146-9ec0-43eb-948b-2f19018073f5	document	TEST_2025052603 - 255126 16:51:29	\N	2025-05-26 22:51:34.171941+00	2025-08-21 14:55:01.362004+00	2025-05-26 22:51:34.171941+00	{"eTag": "\\"6342e2ad101ad411e07ce2d0b5527cbc\\"", "size": 780787, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-26T22:51:35.000Z", "contentLength": 780787, "httpStatusCode": 200}	1fea9710-edb7-4887-8ad4-f97c6d4f1344	\N	{}
e5de0005-4f40-4573-b2a9-c0d718b7d932	image	bd75eec5-1736-456a-9e3e-7e628ab3dfec.jpeg	\N	2025-08-07 22:35:25.116762+00	2025-08-21 14:55:01.362004+00	2025-08-07 22:35:25.116762+00	{"eTag": "\\"63ac10dc7eba4d0617267832221d22bd\\"", "size": 6417, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-08-07T22:35:26.000Z", "contentLength": 6417, "httpStatusCode": 200}	c0cdaae3-5178-4999-8cb0-d5f69ebd46a7	\N	{}
298f6a5e-25e4-4083-a6c1-54b42c7e872d	document	c018181d-41d9-4bca-b0f9-299dbebc90d2.pdf	\N	2025-05-10 20:05:47.736156+00	2025-08-21 14:55:01.362004+00	2025-05-10 20:05:47.736156+00	{"eTag": "\\"1e90de81b375b79200f4982585159164\\"", "size": 36175, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-10T20:05:48.000Z", "contentLength": 36175, "httpStatusCode": 200}	3f2e4533-2a71-4edd-a097-afa8eda26b97	\N	{}
fb1e6927-62d7-4155-b808-e245a7f03156	image	c0eea319-6531-404c-bbf2-72951a14b700.png	\N	2025-08-03 15:53:20.298985+00	2025-08-21 14:55:01.362004+00	2025-08-03 15:53:20.298985+00	{"eTag": "\\"1c10a26bf925ba1401a391ec62cc93dd\\"", "size": 147635, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-03T15:53:21.000Z", "contentLength": 147635, "httpStatusCode": 200}	18480ca0-3c11-498d-8cc9-426be342c9b3	\N	{}
201bf18a-857d-4c0d-a908-cee9ce9308c8	image	c73bab9c-87ae-49bb-8ebd-98a65a7906cf.png	\N	2025-07-25 00:58:17.139171+00	2025-08-21 14:55:01.362004+00	2025-07-25 00:58:17.139171+00	{"eTag": "\\"1c10a26bf925ba1401a391ec62cc93dd\\"", "size": 147635, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-07-25T00:58:18.000Z", "contentLength": 147635, "httpStatusCode": 200}	cab502b2-c960-47b7-8702-0d92be6a6e76	\N	{}
fd695019-1235-4b77-8c9b-41e791142b1a	image	dffcf4fc-961e-4f11-b1cd-6f283d84215f.png	\N	2025-08-03 15:51:18.42545+00	2025-08-21 14:55:01.362004+00	2025-08-03 15:51:18.42545+00	{"eTag": "\\"1c10a26bf925ba1401a391ec62cc93dd\\"", "size": 147635, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-03T15:51:19.000Z", "contentLength": 147635, "httpStatusCode": 200}	6a857d1d-6dab-45ee-a56f-3f49bf7500b7	\N	{}
e8155ce9-0cd5-4a36-b226-67023f423a29	document	docker-compose.yml	\N	2025-05-26 21:37:10.660147+00	2025-08-21 14:55:01.362004+00	2025-05-26 21:37:10.660147+00	{"eTag": "\\"4a29d73a1688db6241eb7e6b59769108\\"", "size": 16273, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-05-26T21:37:11.000Z", "contentLength": 16273, "httpStatusCode": 200}	2330dcf5-8f76-4562-bf5d-806da2133c5f	\N	{}
3552a322-0eee-4a1e-9a2a-9077f55b7500	image	e0098cd6-403d-4e77-a577-982a84f347e9.png	\N	2025-08-03 15:52:54.111495+00	2025-08-21 14:55:01.362004+00	2025-08-03 15:52:54.111495+00	{"eTag": "\\"1c10a26bf925ba1401a391ec62cc93dd\\"", "size": 147635, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-03T15:52:55.000Z", "contentLength": 147635, "httpStatusCode": 200}	432ac298-b51a-4f51-9417-eb5003f05e3e	\N	{}
0f5e9c7d-d1c8-459f-8d52-f776f3dccc7e	image	e2f3461a-f2f1-40b1-b269-8a8e26adde32.png	\N	2025-08-01 01:26:15.04054+00	2025-08-21 14:55:01.362004+00	2025-08-01 01:26:15.04054+00	{"eTag": "\\"05020197452b31b8f4ba63b05f28ef36\\"", "size": 221977, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T01:26:15.000Z", "contentLength": 221977, "httpStatusCode": 200}	a095c8a1-f91c-4b48-9fc9-bc8c4f4f9c50	\N	{}
a857424d-66b7-40ec-ae8d-e32beb1e6561	document	e9217a22-a6f2-4706-b327-19f0afee1ea4.pdf	\N	2025-05-15 21:41:22.579818+00	2025-08-21 14:55:01.362004+00	2025-05-15 21:41:22.579818+00	{"eTag": "\\"1e90de81b375b79200f4982585159164\\"", "size": 36175, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-15T21:41:23.000Z", "contentLength": 36175, "httpStatusCode": 200}	3c0ccdbb-0161-47db-aa25-1849c6d50861	\N	{}
e1bfa855-6779-49d3-b8b0-97ed436f679a	image	eb6cc35b-a301-4f03-9bbe-9bc2dda7b182.png	\N	2025-08-01 01:15:04.120842+00	2025-08-21 14:55:01.362004+00	2025-08-01 01:15:04.120842+00	{"eTag": "\\"249b1740c96d23af3c255191e6121f30\\"", "size": 138373, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T01:15:05.000Z", "contentLength": 138373, "httpStatusCode": 200}	53a2f966-af41-4182-b902-7125d4f0b1c8	\N	{}
2315743d-8df1-40ae-a7d5-9a66f8903051	image	ebd0ba18-00f0-41e3-ae4e-f72d104a1349.png	\N	2025-08-08 01:39:06.433025+00	2025-08-21 14:55:01.362004+00	2025-08-08 01:39:06.433025+00	{"eTag": "\\"6cb75f1b888feda44c7108d04ea5db65\\"", "size": 219939, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-08T01:39:07.000Z", "contentLength": 219939, "httpStatusCode": 200}	0464b03d-6e62-4a0b-b560-a6aca4a6fe08	\N	{}
73be48f6-e498-4e43-9488-8fe2d9f6d7be	image	f58db974-413f-497c-a1b0-850f163aba3d.png	\N	2025-08-01 01:39:55.400552+00	2025-08-21 14:55:01.362004+00	2025-08-01 01:39:55.400552+00	{"eTag": "\\"6cb75f1b888feda44c7108d04ea5db65\\"", "size": 219939, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2025-08-01T01:39:56.000Z", "contentLength": 219939, "httpStatusCode": 200}	35567b4e-7ada-4fcd-9839-fe67e1828db4	\N	{}
cda09456-4f33-4870-b49a-c57bf1d57586	document	test	\N	2025-05-19 18:51:08.714523+00	2025-08-21 14:55:01.362004+00	2025-05-19 18:51:08.714523+00	{"eTag": "\\"1e90de81b375b79200f4982585159164\\"", "size": 36175, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-19T18:51:48.000Z", "contentLength": 36175, "httpStatusCode": 200}	a967e894-2772-4fcd-8db4-d691a560ad1e	\N	{}
ebf2b20c-d378-487b-ad26-fef87e9dc99d	document	test1	\N	2025-05-20 13:54:34.894476+00	2025-08-21 14:55:01.362004+00	2025-05-20 13:54:34.894476+00	{"eTag": "\\"1e90de81b375b79200f4982585159164\\"", "size": 36175, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-20T13:54:35.000Z", "contentLength": 36175, "httpStatusCode": 200}	5c4e1e59-0e1c-444a-a50f-79aab2b774ef	\N	{}
1417c217-bb74-4d58-803c-e6d355618119	document	test3	\N	2025-05-22 23:57:14.479927+00	2025-08-21 14:55:01.362004+00	2025-05-22 23:57:14.479927+00	{"eTag": "\\"1e90de81b375b79200f4982585159164\\"", "size": 36175, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-22T23:57:15.000Z", "contentLength": 36175, "httpStatusCode": 200}	4fff7dfe-42c4-43a6-adf8-9ba6f60ab129	\N	{}
59705f14-381c-4bfe-ac08-cf9ade82fbb6	document	test4	\N	2025-05-23 00:12:27.421356+00	2025-08-21 14:55:01.362004+00	2025-05-23 00:12:27.421356+00	{"eTag": "\\"1e90de81b375b79200f4982585159164\\"", "size": 36175, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-23T00:12:28.000Z", "contentLength": 36175, "httpStatusCode": 200}	a962b375-a571-411f-803f-795981217671	\N	{}
7ec6d9ed-3522-4a0c-ac5f-5d1dfd2ef76a	document	time - 251423 11:14:36	\N	2025-05-23 15:14:36.854413+00	2025-08-21 14:55:01.362004+00	2025-05-23 15:14:36.854413+00	{"eTag": "\\"1e90de81b375b79200f4982585159164\\"", "size": 36175, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-23T15:14:37.000Z", "contentLength": 36175, "httpStatusCode": 200}	2f697bb4-d60d-4aae-96cb-50df3d326063	\N	{}
82bb517a-b86a-476e-b2e4-a2214d1c1bb0	document	web422 - 250526 18:05:22	\N	2025-05-26 22:05:23.494029+00	2025-08-21 14:55:01.362004+00	2025-05-26 22:05:23.494029+00	{"eTag": "\\"b8f115ee9caea8384a4a96a408b324b7\\"", "size": 106558, "mimetype": "application/pdf", "cacheControl": "no-cache", "lastModified": "2025-05-26T22:05:24.000Z", "contentLength": 106558, "httpStatusCode": 200}	5b1f108b-2737-4ab9-8271-62d391bed5cd	\N	{}
343c5757-c45b-4094-931c-e812abfffe67	document	web422-v1a-1702_1747772607905.pdf	\N	2025-05-26 21:38:57.861662+00	2025-08-21 14:55:01.362004+00	2025-05-26 21:38:57.861662+00	{"eTag": "\\"b8f115ee9caea8384a4a96a408b324b7\\"", "size": 106558, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-05-26T21:38:58.000Z", "contentLength": 106558, "httpStatusCode": 200}	866d21d3-bcae-4e0a-b896-3ae30677aec2	\N	{}
20007e6e-bc8d-4fb8-bc67-52947ea86f46	document	ebooks/85d0520e-ca32-4df0-8fe0-ae8b4118306a.png	\N	2026-03-05 02:23:16.733647+00	2026-03-05 02:23:16.733647+00	2026-03-05 02:23:16.733647+00	{"eTag": "\\"7d5e6708f024af60be728ea6ac22eb89\\"", "size": 546697, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-05T02:23:17.000Z", "contentLength": 546697, "httpStatusCode": 200}	c8a0a3a9-870b-47e0-9284-021da01ef49a	\N	{}
06e839eb-6bb1-40f5-8ba1-f31604f44ad0	document	058beaf4-34fa-449d-b128-0472017321e4.png	\N	2026-04-03 18:39:33.704294+00	2026-04-03 18:39:33.704294+00	2026-04-03 18:39:33.704294+00	{"eTag": "\\"7544e9c307aa6eeb941df9e38da815a7\\"", "size": 79552, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-04-03T18:39:34.000Z", "contentLength": 79552, "httpStatusCode": 200}	b02a34a2-bfe9-4a38-bd6f-33a11502d166	\N	{}
809c1283-6d19-4a56-8037-c900311ac6af	document	edd8c96e-ee03-443f-b82d-151143b3bdce.png	\N	2026-04-03 18:39:37.741305+00	2026-04-03 18:39:37.741305+00	2026-04-03 18:39:37.741305+00	{"eTag": "\\"7ab0b5f8e8d5da692275d421f925fce2\\"", "size": 37373, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-04-03T18:39:38.000Z", "contentLength": 37373, "httpStatusCode": 200}	7e0e344f-64bc-4626-b1bc-58af71e1f01b	\N	{}
91857a0b-d4f3-4a2d-92c7-1a9c404fb934	document	47fcc7cd-7ddd-4a4f-b56b-e48da033d64c.jpg	\N	2026-04-03 18:39:44.604421+00	2026-04-03 18:39:44.604421+00	2026-04-03 18:39:44.604421+00	{"eTag": "\\"dff9c01d18434b84c58a7d83467a5084\\"", "size": 86198, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-03T18:39:45.000Z", "contentLength": 86198, "httpStatusCode": 200}	736b8ea6-36ed-4ad2-916d-4d15f63d3752	\N	{}
038105ae-8c7f-44fc-99ae-dd4a89f6b91e	document	9e82d20d-0a4b-43f1-9e24-ec345154b9cc.jpg	\N	2026-04-03 20:28:42.787328+00	2026-04-03 20:28:42.787328+00	2026-04-03 20:28:42.787328+00	{"eTag": "\\"dff9c01d18434b84c58a7d83467a5084\\"", "size": 86198, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-03T20:28:43.000Z", "contentLength": 86198, "httpStatusCode": 200}	48d8bfb7-ecce-4cfd-9ba4-4ef7110d1e5f	\N	{}
c4820286-0e74-4333-91b7-4fb3d7ed703f	document	10aa8a0b-c27c-484b-9e3a-eae81c1af5db.jpg	\N	2026-04-03 20:28:45.579614+00	2026-04-03 20:28:45.579614+00	2026-04-03 20:28:45.579614+00	{"eTag": "\\"69eb9066da0c1527cc09fdd0c22ece77\\"", "size": 138883, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-03T20:28:46.000Z", "contentLength": 138883, "httpStatusCode": 200}	faf07ced-021b-42e5-9f4f-c407f87feb53	\N	{}
fb09060e-a21a-46e2-8014-316291de9f6b	document	c9a805b2-5e54-4159-974d-be25118db5c5.jpg	\N	2026-04-03 20:45:26.993458+00	2026-04-03 20:45:26.993458+00	2026-04-03 20:45:26.993458+00	{"eTag": "\\"69eb9066da0c1527cc09fdd0c22ece77\\"", "size": 138883, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-03T20:45:27.000Z", "contentLength": 138883, "httpStatusCode": 200}	0cfcb59c-4928-4325-9034-18e684f7edf2	\N	{}
cfcfb5da-90f4-4380-961f-35b479ada177	image	630537c5-de75-47c0-87ba-0d830730e9cb.jpeg	\N	2026-04-10 00:08:58.785959+00	2026-04-10 00:08:58.785959+00	2026-04-10 00:08:58.785959+00	{"eTag": "\\"e007cdcf37214812ea44ae95ee9d08e4\\"", "size": 847319, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-10T00:08:59.000Z", "contentLength": 847319, "httpStatusCode": 200}	2022b7fb-4382-4f14-8ad2-ed4ea5571934	\N	{}
e395dfa8-9a2d-418e-8c9f-5b23097fcc40	image	cf372b28-00ad-4156-b37a-4da36f64f68c.jpeg	\N	2026-04-10 00:10:40.150761+00	2026-04-10 00:10:40.150761+00	2026-04-10 00:10:40.150761+00	{"eTag": "\\"c3c41b016715a42790e0496d36680de3\\"", "size": 1786507, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-10T00:10:41.000Z", "contentLength": 1786507, "httpStatusCode": 200}	6e2c7818-59b1-4a51-816e-0f47f15ecf2f	\N	{}
a3e005a1-0b95-4404-8203-421eb492262b	image	1243c252-0184-432d-9e1a-aa099735cbef.png	\N	2026-04-16 22:41:35.166215+00	2026-04-16 22:41:35.166215+00	2026-04-16 22:41:35.166215+00	{"eTag": "\\"6784b81db066e811604b2d32ca08b245-2\\"", "size": 10029259, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-04-16T22:41:35.000Z", "contentLength": 10029259, "httpStatusCode": 200}	64bb740d-ab40-4545-8331-fe656dcc1f8f	\N	{}
2384cdac-bcdd-4e4b-9773-1de1ac174a37	image	6eb84401-a053-48d4-94e1-37b5dfc4b5f8.png	\N	2026-04-16 23:32:24.032443+00	2026-04-16 23:32:24.032443+00	2026-04-16 23:32:24.032443+00	{"eTag": "\\"6784b81db066e811604b2d32ca08b245-2\\"", "size": 10029259, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-04-16T23:32:24.000Z", "contentLength": 10029259, "httpStatusCode": 200}	5850f806-13a6-4e66-9925-b376142d5691	\N	{}
cdab48b1-d402-48b7-b340-d04daff3561c	image	2885dbbe-4d01-4ebb-97ec-3180975cf789.png	\N	2026-04-16 23:54:54.624008+00	2026-04-16 23:54:54.624008+00	2026-04-16 23:54:54.624008+00	{"eTag": "\\"6784b81db066e811604b2d32ca08b245-2\\"", "size": 10029259, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-04-16T23:54:55.000Z", "contentLength": 10029259, "httpStatusCode": 200}	a11132a9-1c48-440e-8c1b-88f6a159651d	\N	{}
e2d55ba7-4239-4084-97cf-aa02f44c8356	image	e331eef6-f157-4d2b-8cfc-f85f2988f70f.jpeg	\N	2026-04-23 17:25:58.468027+00	2026-04-23 17:25:58.468027+00	2026-04-23 17:25:58.468027+00	{"eTag": "\\"c514595df6064418544132342e555ae2\\"", "size": 840243, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-23T17:25:59.000Z", "contentLength": 840243, "httpStatusCode": 200}	61aec3e3-9ccd-4795-bc7a-8cc46b193c6b	\N	{}
b883be29-b3a5-4e20-b513-179a3994b100	image	c75da032-f163-4454-8667-eb75279ac2fb.jpeg	\N	2026-04-23 17:26:22.325395+00	2026-04-23 17:26:22.325395+00	2026-04-23 17:26:22.325395+00	{"eTag": "\\"6b60daa8650480e0d0e871e20cce8616\\"", "size": 1899513, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-04-23T17:26:23.000Z", "contentLength": 1899513, "httpStatusCode": 200}	ca4b124c-7292-4722-ae9f-832953b59dd2	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata", "metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."vector_indexes" ("id", "name", "bucket_id", "data_type", "dimension", "distance_metric", "metadata_configuration", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict hCr5A2ufG51B07hP4LPcBT1BPtJuN8BIKCD5lyxM3qZ3VZ8xgk2ilbEcqtUWXlH

RESET ALL;
