--
-- PostgreSQL database dump
--

\restrict EXmJ1A3g9vODJyQnRIdiPScLqn0Ors1NfpEPQ1xeEXx2cfQmwtSw9YrK5IdSN9d

-- Dumped from database version 16.8 (Debian 16.8-1.pgdg120+1)
-- Dumped by pg_dump version 16.11 (Homebrew)

-- Started on 2026-01-27 20:14:36 -03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS "projects_createdBy_fkey";
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_before_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_after_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public."Video" DROP CONSTRAINT IF EXISTS "Video_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_clientId_fkey";
ALTER TABLE IF EXISTS ONLY public."Gallery" DROP CONSTRAINT IF EXISTS "Gallery_projectId_fkey";
DROP INDEX IF EXISTS public.projects_before_image_id_key;
DROP INDEX IF EXISTS public.projects_after_image_id_key;
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."Donation_transaction_id_key";
DROP INDEX IF EXISTS public."Client_email_key";
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."Video" DROP CONSTRAINT IF EXISTS "Video_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."Gallery" DROP CONSTRAINT IF EXISTS "Gallery_pkey";
ALTER TABLE IF EXISTS ONLY public."Donation" DROP CONSTRAINT IF EXISTS "Donation_pkey";
ALTER TABLE IF EXISTS ONLY public."Client" DROP CONSTRAINT IF EXISTS "Client_pkey";
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."Video";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Gallery";
DROP TABLE IF EXISTS public."Donation";
DROP TABLE IF EXISTS public."Client";
DROP TYPE IF EXISTS public."UserRole";
DROP TYPE IF EXISTS public."ProjectType";
DROP TYPE IF EXISTS public."ProjectStatus";
DROP TYPE IF EXISTS public."ProjectCategory";
DROP TYPE IF EXISTS public."DonationStatus";
-- *not* dropping schema, since initdb creates it
--
-- TOC entry 5 (class 2615 OID 26952)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 3437 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 846 (class 1247 OID 33441)
-- Name: DonationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DonationStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


--
-- TOC entry 864 (class 1247 OID 26986)
-- Name: ProjectCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProjectCategory" AS ENUM (
    'ESTACIONES',
    'TIENDAS',
    'COMERCIALES'
);


--
-- TOC entry 861 (class 1247 OID 26980)
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'PENDING'
);


--
-- TOC entry 858 (class 1247 OID 26970)
-- Name: ProjectType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProjectType" AS ENUM (
    'LANDING',
    'ECOMMERCE',
    'INMOBILIARIA',
    'CUSTOM'
);


--
-- TOC entry 855 (class 1247 OID 26963)
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'CLIENT_ADMIN',
    'CLIENT'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 27001)
-- Name: Client; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Client" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 33449)
-- Name: Donation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Donation" (
    id text NOT NULL,
    donor_name text NOT NULL,
    donor_email text,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    message text,
    is_anonymous boolean DEFAULT false NOT NULL,
    status public."DonationStatus" DEFAULT 'PENDING'::public."DonationStatus" NOT NULL,
    payment_method text,
    transaction_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 218 (class 1259 OID 27019)
-- Name: Gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Gallery" (
    id text NOT NULL,
    url text NOT NULL,
    title text,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    "projectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 216 (class 1259 OID 26993)
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."UserRole" NOT NULL,
    "clientId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 28811)
-- Name: Video; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Video" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    youtube_url text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "projectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 26953)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 27237)
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id text NOT NULL,
    name text NOT NULL,
    type public."ProjectType",
    status public."ProjectStatus" DEFAULT 'DRAFT'::public."ProjectStatus" NOT NULL,
    category public."ProjectCategory",
    description text,
    long_description text,
    image_before text,
    image_after text,
    latitude double precision,
    longitude double precision,
    country text,
    state text,
    city text,
    area text,
    duration text,
    date text,
    url text,
    client_id text NOT NULL,
    challenge text,
    solution text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    before_image_id text,
    after_image_id text,
    "createdBy" text,
    end_date timestamp(3) without time zone,
    start_date timestamp(3) without time zone,
    address jsonb,
    budget text,
    contact_email text,
    contact_name text,
    contact_phone text,
    invoice_status text,
    notes text,
    "order" integer DEFAULT 0 NOT NULL,
    demo_url text,
    github_url text,
    technologies jsonb
);


--
-- TOC entry 3427 (class 0 OID 27001)
-- Dependencies: 217
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Client" (id, name, email, "createdAt", "updatedAt") FROM stdin;
78abe353-1728-49b0-b268-1d2ad5786317	Kamak desarrollos	kamakdesarrollos@gmail.com	2025-06-22 22:39:34.316	2025-06-22 22:39:34.316
bd70958e-483b-483d-b490-17987441855d	Vicmano Music	vicmano@gmail.com	2025-07-18 03:00:05.319	2025-07-18 03:00:05.319
62c089a2-ad4c-4735-a2bd-234b20a8d0e2	Cliente Ejemplo	cliente@ejemplo.com	2025-08-05 18:50:50.548	2025-08-05 18:50:50.548
88b59ed0-4d52-45db-bd21-ef72a8338fbc	Candela Landi	landicandela01@mgmail.com	2025-08-09 15:02:13.042	2025-08-09 15:02:13.042
1f0139c9-172a-4e63-8c65-a0fa36a8f32e	Candela	landicandela01@gmail.com	2025-08-19 12:05:19.678	2025-08-19 12:05:19.678
a49284fc-c5cc-471e-a4f7-1fb71925c1e3	Rakium	rakium.root@gmail.com	2025-09-22 14:19:41.38	2025-09-22 14:19:41.38
\.


--
-- TOC entry 3431 (class 0 OID 33449)
-- Dependencies: 221
-- Data for Name: Donation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Donation" (id, donor_name, donor_email, amount, currency, message, is_anonymous, status, payment_method, transaction_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3428 (class 0 OID 27019)
-- Dependencies: 218
-- Data for Name: Gallery; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Gallery" (id, url, title, description, "order", "projectId", "createdAt", "updatedAt") FROM stdin;
2659048d-e8f2-43c0-98e7-cc11a8253838	https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/gallery/1754430781933-zk6ewqwwgi.png	\N	\N	0	3f7906e0-0023-400e-831b-f2f746ab64d9	2025-08-05 21:53:01.994	2025-08-05 21:53:01.994
7eb91380-0079-4fd1-8da2-58c37b36b877	https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/gallery/1754571543829-lykkt1ft0ab.png	\N	\N	1	b6d17043-de1b-42d0-bd2e-12f738cb314b	2025-08-07 12:59:03.859	2025-08-07 12:59:03.859
8ba6486f-990c-4a6c-855f-17957a6c9814	https://rakium.s3.us-east-005.backblazeb2.com/projects/66f60329-e7fe-42c4-8c7b-c66f132c5ef1/gallery/1755521341797-k8l3r307dns.webp	\N	\N	0	66f60329-e7fe-42c4-8c7b-c66f132c5ef1	2025-08-18 12:49:01.843	2025-08-18 12:49:01.843
2a4fe66f-b9e0-475c-b013-79f318730b45	https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/gallery/1754571543843-wszkrx1v3gj.png	\N	\N	1	b6d17043-de1b-42d0-bd2e-12f738cb314b	2025-08-07 12:59:03.902	2025-08-07 12:59:03.902
9abaa3e8-9903-4ffd-9f46-be25ece1ba8f	https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/gallery/1754571562343-6xykxcvlutg.png	\N	\N	2	b6d17043-de1b-42d0-bd2e-12f738cb314b	2025-08-07 12:59:22.39	2025-08-07 12:59:22.39
17e4775f-8003-45b2-bca9-338361a106fc	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577581413-ulnys3y8rc.png	\N	\N	5	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:39:41.476	2025-08-07 14:39:41.476
b8c2aa9a-57db-41e4-8b56-625bd12727b8	https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/gallery/1754659330005-ba545kb511g.png	\N	\N	0	d1c6e99a-6159-4efe-a952-36926938529a	2025-08-08 13:22:10.155	2025-08-08 13:22:10.155
0715af6e-b066-495c-902d-dd0f1b4c0d21	https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/gallery/1754659330289-86r4yiy2n44.webp	\N	\N	0	d1c6e99a-6159-4efe-a952-36926938529a	2025-08-08 13:22:10.324	2025-08-08 13:22:10.324
13e6842e-5ab6-4751-a2fa-24237936b099	https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/gallery/1754659330302-6f2i7t7kd9m.webp	\N	\N	0	d1c6e99a-6159-4efe-a952-36926938529a	2025-08-08 13:22:10.342	2025-08-08 13:22:10.342
ca09de1a-004d-4d1e-92ab-47e5ca21e266	https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/gallery/1754923584280-8jtckbglbup.png	\N	\N	0	e3abc867-1e4e-4197-a587-b1f81c21aba5	2025-08-11 14:46:24.334	2025-08-11 14:46:24.334
10b9eefd-4b62-4efa-80cd-f9d5d868824f	https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/gallery/1754923584288-lcvru7cepcj.png	\N	\N	0	e3abc867-1e4e-4197-a587-b1f81c21aba5	2025-08-11 14:46:24.43	2025-08-11 14:46:24.43
db519b89-3f17-4c01-981f-f1e458debdc5	https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/gallery/1754923610654-5gkygkysyso.png	\N	\N	1	e3abc867-1e4e-4197-a587-b1f81c21aba5	2025-08-11 14:46:50.691	2025-08-11 14:46:50.691
ab0003ea-51a5-42db-b590-79aaf940820b	https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/gallery/1754923634858-c4ccc3b5jfk.png	\N	\N	4	e3abc867-1e4e-4197-a587-b1f81c21aba5	2025-08-11 14:47:14.892	2025-08-11 14:47:14.892
34535f8c-6952-43fb-a084-213e128b31d4	https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/gallery/1754923634868-06uawzz4wa98.png	\N	\N	4	e3abc867-1e4e-4197-a587-b1f81c21aba5	2025-08-11 14:47:14.913	2025-08-11 14:47:14.913
c9cfcc0a-a276-4aa8-bdbe-ccbb66298e2c	https://rakium.s3.us-east-005.backblazeb2.com/projects/72fb9387-0da5-4e8b-9dec-7e8f472cc710/gallery/1755006786886-492qjhkjwrp.png	\N	\N	3	72fb9387-0da5-4e8b-9dec-7e8f472cc710	2025-08-12 13:53:07.031	2025-08-12 13:53:07.031
62400c47-b1b3-4bd3-8e46-25b9a0258ed7	https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/gallery/1755185356369-lqrnevt1g1.webp	\N	\N	0	6f7156a1-6134-4614-bb73-d8a7eb942ce6	2025-08-14 15:29:16.406	2025-08-14 15:29:16.406
abc8de89-476f-4a6e-9e29-7e600d124cdd	https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/gallery/1755185374341-pi5i7q4qi.webp	\N	\N	1	6f7156a1-6134-4614-bb73-d8a7eb942ce6	2025-08-14 15:29:34.386	2025-08-14 15:29:34.386
8b75f54b-9512-48d5-ba3d-9c43fc007d87	https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/gallery/1755185390203-ek6ph2yiho.webp	\N	\N	2	6f7156a1-6134-4614-bb73-d8a7eb942ce6	2025-08-14 15:29:50.29	2025-08-14 15:29:50.29
60769d33-5a3b-44be-a9ea-38fa61b9c854	https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/gallery/1755185401662-23ay8v2gpp6.webp	\N	\N	3	6f7156a1-6134-4614-bb73-d8a7eb942ce6	2025-08-14 15:30:01.77	2025-08-14 15:30:01.77
2cefd1e5-d728-40b9-94f9-9c16412bb779	https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/gallery/1755185413985-igpht07bd8.webp	\N	\N	4	6f7156a1-6134-4614-bb73-d8a7eb942ce6	2025-08-14 15:30:14.024	2025-08-14 15:30:14.024
e28c140a-35a8-4cfd-b4bd-a5360ae7fefe	https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/gallery/1755185422089-mpadoshd6ii.webp	\N	\N	5	6f7156a1-6134-4614-bb73-d8a7eb942ce6	2025-08-14 15:30:22.125	2025-08-14 15:30:22.125
0464d6d5-02c6-49f1-9c65-3b3b9e599a4b	https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/gallery/1755185458403-o85pdbnojyr.webp	\N	\N	6	6f7156a1-6134-4614-bb73-d8a7eb942ce6	2025-08-14 15:30:58.444	2025-08-14 15:30:58.444
3644c69d-7374-4d6a-bdbd-a2ee4193edce	https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/gallery/1755185467696-e77ojcy42sf.png	\N	\N	7	6f7156a1-6134-4614-bb73-d8a7eb942ce6	2025-08-14 15:31:07.743	2025-08-14 15:31:07.743
fc8a2983-edbb-4591-9b41-d55a77b38958	https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/gallery/1755185475078-ke8cpueakvf.png	\N	\N	8	6f7156a1-6134-4614-bb73-d8a7eb942ce6	2025-08-14 15:31:15.134	2025-08-14 15:31:15.134
d72c28a1-c38b-4d7f-9200-feef5294e9cd	https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/gallery/1755185483470-84mfp114j4h.png	\N	\N	9	6f7156a1-6134-4614-bb73-d8a7eb942ce6	2025-08-14 15:31:23.527	2025-08-14 15:31:23.527
d7fb655f-1dbb-4820-b70e-540db560abb0	https://rakium.s3.us-east-005.backblazeb2.com/projects/66f60329-e7fe-42c4-8c7b-c66f132c5ef1/gallery/1755521370338-rqp5am4lzb.png	\N	\N	1	66f60329-e7fe-42c4-8c7b-c66f132c5ef1	2025-08-18 12:49:30.381	2025-08-18 12:49:30.381
77d2ab23-8c91-4986-9fd5-17a3761d68c7	https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/gallery/1754430832764-88ukkqmjcv.png	\N	\N	2	3f7906e0-0023-400e-831b-f2f746ab64d9	2025-08-05 21:53:52.815	2025-08-05 21:53:52.815
081f394e-8fd9-4efc-9db2-827f79118fbf	https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/gallery/1754430832794-3px1y03tusd.png	\N	\N	2	3f7906e0-0023-400e-831b-f2f746ab64d9	2025-08-05 21:53:52.836	2025-08-05 21:53:52.836
1f5e206b-7994-4745-bfd1-18e36ba07847	https://rakium.s3.us-east-005.backblazeb2.com/projects/66f60329-e7fe-42c4-8c7b-c66f132c5ef1/gallery/1755521387177-q9ajqyyy1n.png	\N	\N	2	66f60329-e7fe-42c4-8c7b-c66f132c5ef1	2025-08-18 12:49:47.228	2025-08-18 12:49:47.228
76fedba2-e6aa-411a-8057-e0e735a9a438	https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/gallery/1754430882066-4rzwk35y5ro.png	\N	\N	4	3f7906e0-0023-400e-831b-f2f746ab64d9	2025-08-05 21:54:42.126	2025-08-05 21:54:42.126
bbd27152-83c1-4b60-917d-3e1996fef3dd	https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/gallery/1754571814144-98dxqff5ce7.png	\N	\N	3	b6d17043-de1b-42d0-bd2e-12f738cb314b	2025-08-07 13:03:34.186	2025-08-07 13:03:34.186
5bdd8ec6-a5fc-4df2-abb3-ae42b4817a3d	https://rakium.s3.us-east-005.backblazeb2.com/projects/66f60329-e7fe-42c4-8c7b-c66f132c5ef1/gallery/1755521489816-135uqlt3qcvq.png	\N	\N	3	66f60329-e7fe-42c4-8c7b-c66f132c5ef1	2025-08-18 12:51:29.857	2025-08-18 12:51:29.857
0e6115ac-82f9-4ce8-8f64-8eb0d19a4545	https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/gallery/1754571903592-4i83ga1782.png	\N	\N	4	b6d17043-de1b-42d0-bd2e-12f738cb314b	2025-08-07 13:05:03.646	2025-08-07 13:05:03.646
64e3e5fd-177f-454c-9e56-115889bc8488	https://rakium.s3.us-east-005.backblazeb2.com/projects/66f60329-e7fe-42c4-8c7b-c66f132c5ef1/gallery/1755521528210-21dkeaty774.png	\N	\N	4	66f60329-e7fe-42c4-8c7b-c66f132c5ef1	2025-08-18 12:52:08.281	2025-08-18 12:52:08.281
37745754-616c-433e-a448-f4f75ddb479b	https://rakium.s3.us-east-005.backblazeb2.com/projects/54b60f9b-6ee0-4f9b-8556-33f0aee2e274/gallery/1755523292955-pebt2w3h1q.webp	\N	\N	0	54b60f9b-6ee0-4f9b-8556-33f0aee2e274	2025-08-18 13:21:33.02	2025-08-18 13:21:33.02
58dff013-476a-4179-ba27-862b3b506612	https://rakium.s3.us-east-005.backblazeb2.com/projects/54b60f9b-6ee0-4f9b-8556-33f0aee2e274/gallery/1755523318420-s2mzffbnc1.webp	\N	\N	1	54b60f9b-6ee0-4f9b-8556-33f0aee2e274	2025-08-18 13:21:58.525	2025-08-18 13:21:58.525
4f022720-9959-4d8c-9bf3-ff9103cbd574	https://rakium.s3.us-east-005.backblazeb2.com/projects/54b60f9b-6ee0-4f9b-8556-33f0aee2e274/gallery/1755523353584-hh18w1afels.webp	\N	\N	2	54b60f9b-6ee0-4f9b-8556-33f0aee2e274	2025-08-18 13:22:33.65	2025-08-18 13:22:33.65
f2e023ab-dd1d-465d-ba22-f06865b1bffc	https://rakium.s3.us-east-005.backblazeb2.com/projects/54b60f9b-6ee0-4f9b-8556-33f0aee2e274/gallery/1755523373261-tq1k706qytp.webp	\N	\N	3	54b60f9b-6ee0-4f9b-8556-33f0aee2e274	2025-08-18 13:22:53.319	2025-08-18 13:22:53.319
2d295b2e-6a95-4caa-9983-642e603e78a0	https://rakium.s3.us-east-005.backblazeb2.com/projects/66f60329-e7fe-42c4-8c7b-c66f132c5ef1/gallery/1755521581255-cc9ya9al7is.png	\N	\N	5	66f60329-e7fe-42c4-8c7b-c66f132c5ef1	2025-08-18 12:53:01.297	2025-08-18 12:53:01.297
2dab20dd-cf85-4acc-92b9-1741a3f0e591	https://rakium.s3.us-east-005.backblazeb2.com/projects/54b60f9b-6ee0-4f9b-8556-33f0aee2e274/gallery/1755523405679-jisqbuzkecp.webp	\N	\N	4	54b60f9b-6ee0-4f9b-8556-33f0aee2e274	2025-08-18 13:23:25.726	2025-08-18 13:23:25.726
8367d5f1-024a-4c8a-ab59-5ca12a09cbc0	https://rakium.s3.us-east-005.backblazeb2.com/projects/54b60f9b-6ee0-4f9b-8556-33f0aee2e274/gallery/1755523406093-cd8n8c02naf.webp	\N	\N	5	54b60f9b-6ee0-4f9b-8556-33f0aee2e274	2025-08-18 13:23:26.367	2025-08-18 13:23:26.367
0b674891-7af5-46f8-9028-e1937f01d4cd	https://rakium.s3.us-east-005.backblazeb2.com/projects/54b60f9b-6ee0-4f9b-8556-33f0aee2e274/gallery/1755523427686-kpvaipavsa.png	\N	\N	6	54b60f9b-6ee0-4f9b-8556-33f0aee2e274	2025-08-18 13:23:47.73	2025-08-18 13:23:47.73
1655d3a5-0d18-4597-a067-4d61e5f4130d	https://rakium.s3.us-east-005.backblazeb2.com/projects/54b60f9b-6ee0-4f9b-8556-33f0aee2e274/gallery/1755523428221-w07h1mlvuir.webp	\N	\N	7	54b60f9b-6ee0-4f9b-8556-33f0aee2e274	2025-08-18 13:23:48.27	2025-08-18 13:23:48.27
42c8907d-f175-4acd-824e-99681bde3248	https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/gallery/1754430781928-x9p0bwux8cr.png	\N	\N	0	3f7906e0-0023-400e-831b-f2f746ab64d9	2025-08-05 21:53:02.006	2025-08-05 21:53:02.006
6826822d-d66c-4247-8905-71fa1cc6b78d	https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/gallery/1754430815279-nadnlmb5den.png	\N	\N	1	3f7906e0-0023-400e-831b-f2f746ab64d9	2025-08-05 21:53:35.317	2025-08-05 21:53:35.317
1d64ad3b-876c-4106-918b-b200aa20a514	https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/gallery/1754430832780-u6m2e241mpj.png	\N	\N	2	3f7906e0-0023-400e-831b-f2f746ab64d9	2025-08-05 21:53:52.831	2025-08-05 21:53:52.831
d0197c04-64dd-4591-814f-3ca6c7cf4108	https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/gallery/1754430883390-ecohlm52rbo.png	\N	\N	5	3f7906e0-0023-400e-831b-f2f746ab64d9	2025-08-05 21:54:43.437	2025-08-05 21:54:43.437
c31f493e-dfa5-4e03-a924-089f70330c65	https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/gallery/1754571915821-jzofu71bg3t.png	\N	\N	5	b6d17043-de1b-42d0-bd2e-12f738cb314b	2025-08-07 13:05:15.861	2025-08-07 13:05:15.861
fc3cf175-0524-4b92-bc88-480b9c5a0baf	https://rakium.s3.us-east-005.backblazeb2.com/projects/6b3b5fb1-5b42-4f33-b612-72c9a2512d4e/gallery/1754580697008-2xt5qupgjrz.png	\N	\N	0	6b3b5fb1-5b42-4f33-b612-72c9a2512d4e	2025-08-07 15:31:37.056	2025-08-07 15:31:37.056
960c2015-c2fc-40f0-b65e-5fe649681856	https://rakium.s3.us-east-005.backblazeb2.com/projects/6b3b5fb1-5b42-4f33-b612-72c9a2512d4e/gallery/1754580718557-nrjdlpzoh8l.webp	\N	\N	2	6b3b5fb1-5b42-4f33-b612-72c9a2512d4e	2025-08-07 15:31:58.621	2025-08-07 15:31:58.621
5e584086-b188-4d1d-99cc-3451b5c9de42	https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/gallery/1754659354830-qmnw8mbkuvo.png	\N	\N	1	d1c6e99a-6159-4efe-a952-36926938529a	2025-08-08 13:22:34.873	2025-08-08 13:22:34.873
a60bfcaf-8775-47e4-9e2a-9935bb166c1d	https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/gallery/1754659371137-q4ir19aeq4.png	\N	\N	3	d1c6e99a-6159-4efe-a952-36926938529a	2025-08-08 13:22:51.181	2025-08-08 13:22:51.181
94c06409-f2bd-4307-a1d9-c6082a5841da	https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/gallery/1754659371279-g76y4m9o47r.webp	\N	\N	3	d1c6e99a-6159-4efe-a952-36926938529a	2025-08-08 13:22:51.79	2025-08-08 13:22:51.79
a061f34e-c83c-44c5-a969-1c6099cfcdbf	https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/gallery/1754923634986-mf0le869i5.png	\N	\N	5	e3abc867-1e4e-4197-a587-b1f81c21aba5	2025-08-11 14:47:15.031	2025-08-11 14:47:15.031
9514219c-0444-4a41-893c-9cde5f2afcef	https://rakium.s3.us-east-005.backblazeb2.com/projects/705f4dae-a77f-420e-9f80-edfb5e2dae26/gallery/1755090553084-7koy9r5wf5e.png	\N	\N	0	705f4dae-a77f-420e-9f80-edfb5e2dae26	2025-08-13 13:09:13.179	2025-08-13 13:09:13.179
62a7ea67-7e5a-4ae0-a827-42acf30fae39	https://rakium.s3.us-east-005.backblazeb2.com/projects/705f4dae-a77f-420e-9f80-edfb5e2dae26/gallery/1755090553186-8cuxv7udcbc.png	\N	\N	0	705f4dae-a77f-420e-9f80-edfb5e2dae26	2025-08-13 13:09:13.223	2025-08-13 13:09:13.223
b58d67d3-3acc-422a-89fe-ede31d76b0bb	https://rakium.s3.us-east-005.backblazeb2.com/projects/705f4dae-a77f-420e-9f80-edfb5e2dae26/gallery/1755090572860-a3qkbw1x4.png	\N	\N	2	705f4dae-a77f-420e-9f80-edfb5e2dae26	2025-08-13 13:09:32.92	2025-08-13 13:09:32.92
f81a694d-0792-49f1-9311-ebb3885ce50d	https://rakium.s3.us-east-005.backblazeb2.com/projects/705f4dae-a77f-420e-9f80-edfb5e2dae26/gallery/1755090572885-yac48234cy.png	\N	\N	2	705f4dae-a77f-420e-9f80-edfb5e2dae26	2025-08-13 13:09:32.948	2025-08-13 13:09:32.948
84f5f294-93b7-455d-95ab-c3d4647eade4	https://rakium.s3.us-east-005.backblazeb2.com/projects/705f4dae-a77f-420e-9f80-edfb5e2dae26/gallery/1755090572914-s6s0ynrrbgj.png	\N	\N	2	705f4dae-a77f-420e-9f80-edfb5e2dae26	2025-08-13 13:09:32.98	2025-08-13 13:09:32.98
407e526a-e60e-4dbc-bae4-5f1ed1b4fa98	https://rakium.s3.us-east-005.backblazeb2.com/projects/69844e46-f13c-4620-b05f-fe5a521fcce8/gallery/1755262469866-t7ql06okmo.png	\N	\N	0	69844e46-f13c-4620-b05f-fe5a521fcce8	2025-08-15 12:54:29.995	2025-08-15 12:54:29.995
acef93ab-80cd-42ae-b3f9-84bbeb4a9eee	https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/gallery/1755525974288-9rzuljz5gd.png	\N	\N	0	af3d72b4-ad85-48e8-a047-75457ed31786	2025-08-18 14:06:14.328	2025-08-18 14:06:14.328
cb4ae7d1-6660-431b-8c35-4606b30e1809	https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/gallery/1754431200166-a18rizlnfov.png	\N	\N	7	3f7906e0-0023-400e-831b-f2f746ab64d9	2025-08-05 22:00:00.3	2025-08-05 22:00:00.3
f46dd9a1-ef11-421f-b52f-b586787d6b35	https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/gallery/1754571915943-9nm3i09wb2i.png	\N	\N	6	b6d17043-de1b-42d0-bd2e-12f738cb314b	2025-08-07 13:05:15.994	2025-08-07 13:05:15.994
543e285f-89cb-4618-8293-d5bb04993676	https://rakium.s3.us-east-005.backblazeb2.com/projects/6b3b5fb1-5b42-4f33-b612-72c9a2512d4e/gallery/1754580697026-3bmg3aqnhp3.png	\N	\N	0	6b3b5fb1-5b42-4f33-b612-72c9a2512d4e	2025-08-07 15:31:37.087	2025-08-07 15:31:37.087
bd7b89c6-54cb-498c-a9c2-c1261596cb38	https://rakium.s3.us-east-005.backblazeb2.com/projects/6b3b5fb1-5b42-4f33-b612-72c9a2512d4e/gallery/1754580697092-qb8eqpzol5.png	\N	\N	0	6b3b5fb1-5b42-4f33-b612-72c9a2512d4e	2025-08-07 15:31:37.133	2025-08-07 15:31:37.133
785415b5-4fce-41e3-a396-c29133f3794a	https://rakium.s3.us-east-005.backblazeb2.com/projects/6b3b5fb1-5b42-4f33-b612-72c9a2512d4e/gallery/1754580718258-1s5pph6ek21.png	\N	\N	1	6b3b5fb1-5b42-4f33-b612-72c9a2512d4e	2025-08-07 15:31:58.332	2025-08-07 15:31:58.332
a71e6146-9c5a-4a1c-b3b2-84bee872789a	https://rakium.s3.us-east-005.backblazeb2.com/projects/6b3b5fb1-5b42-4f33-b612-72c9a2512d4e/gallery/1754580718544-l3a3adr9eor.webp	\N	\N	2	6b3b5fb1-5b42-4f33-b612-72c9a2512d4e	2025-08-07 15:31:58.627	2025-08-07 15:31:58.627
e2496698-2d95-44c8-9f40-c65a7022c028	https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/gallery/1754659355068-i0du7gkycqa.webp	\N	\N	2	d1c6e99a-6159-4efe-a952-36926938529a	2025-08-08 13:22:35.105	2025-08-08 13:22:35.105
4990c6f8-41d8-484a-adca-08a3abbc1011	https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/gallery/1754659354986-10z5kgbhikaa.webp	\N	\N	1	d1c6e99a-6159-4efe-a952-36926938529a	2025-08-08 13:22:35.208	2025-08-08 13:22:35.208
536b7482-9c00-4714-875f-6893f29009f4	https://rakium.s3.us-east-005.backblazeb2.com/projects/72fb9387-0da5-4e8b-9dec-7e8f472cc710/gallery/1755006710335-m91g7mazxv.webp	\N	\N	0	72fb9387-0da5-4e8b-9dec-7e8f472cc710	2025-08-12 13:51:50.379	2025-08-12 13:51:50.379
79093124-4784-4cfb-995e-9a3eb005cc6f	https://rakium.s3.us-east-005.backblazeb2.com/projects/72fb9387-0da5-4e8b-9dec-7e8f472cc710/gallery/1755006710342-i2u8e9pqeai.webp	\N	\N	0	72fb9387-0da5-4e8b-9dec-7e8f472cc710	2025-08-12 13:51:50.407	2025-08-12 13:51:50.407
077374e1-4387-458b-9a16-1625c6bcd131	https://rakium.s3.us-east-005.backblazeb2.com/projects/72fb9387-0da5-4e8b-9dec-7e8f472cc710/gallery/1755006710277-55x7flbl687.webp	\N	\N	0	72fb9387-0da5-4e8b-9dec-7e8f472cc710	2025-08-12 13:51:50.725	2025-08-12 13:51:50.725
4ee1ff33-d492-48ab-808f-b0e44952dd24	https://rakium.s3.us-east-005.backblazeb2.com/projects/705f4dae-a77f-420e-9f80-edfb5e2dae26/gallery/1755090553071-gy28jyu3cpg.png	\N	\N	0	705f4dae-a77f-420e-9f80-edfb5e2dae26	2025-08-13 13:09:13.185	2025-08-13 13:09:13.185
84dbf5d8-a0c3-4082-a05c-54e3f7deff0f	https://rakium.s3.us-east-005.backblazeb2.com/projects/705f4dae-a77f-420e-9f80-edfb5e2dae26/gallery/1755090553330-ytpks1bsb1b.webp	\N	\N	0	705f4dae-a77f-420e-9f80-edfb5e2dae26	2025-08-13 13:09:13.394	2025-08-13 13:09:13.394
db61cdef-90db-4f35-b93c-6f09cfc53815	https://rakium.s3.us-east-005.backblazeb2.com/projects/705f4dae-a77f-420e-9f80-edfb5e2dae26/gallery/1755090559370-j8tndfj6rys.png	\N	\N	1	705f4dae-a77f-420e-9f80-edfb5e2dae26	2025-08-13 13:09:19.429	2025-08-13 13:09:19.429
a0f68b9e-7bb4-4098-a782-1a2fa29163a2	https://rakium.s3.us-east-005.backblazeb2.com/projects/705f4dae-a77f-420e-9f80-edfb5e2dae26/gallery/1755090572896-8fuaff5tfl3.png	\N	\N	2	705f4dae-a77f-420e-9f80-edfb5e2dae26	2025-08-13 13:09:32.954	2025-08-13 13:09:32.954
459a8a52-ec0f-4ae0-88df-f88b717c66f2	https://rakium.s3.us-east-005.backblazeb2.com/projects/705f4dae-a77f-420e-9f80-edfb5e2dae26/gallery/1755090572910-v4cy9y09ktk.png	\N	\N	2	705f4dae-a77f-420e-9f80-edfb5e2dae26	2025-08-13 13:09:32.97	2025-08-13 13:09:32.97
e31bb285-095f-4263-a906-273b9ea8be7f	https://rakium.s3.us-east-005.backblazeb2.com/projects/69844e46-f13c-4620-b05f-fe5a521fcce8/gallery/1755263622439-h6qzz324xfo.webp	\N	\N	1	69844e46-f13c-4620-b05f-fe5a521fcce8	2025-08-15 13:13:42.621	2025-08-15 13:13:42.621
5a022b5e-1348-4993-a77c-11a6e72e003c	https://rakium.s3.us-east-005.backblazeb2.com/projects/69844e46-f13c-4620-b05f-fe5a521fcce8/gallery/1755263752138-49mspcm9jcq.webp	\N	\N	2	69844e46-f13c-4620-b05f-fe5a521fcce8	2025-08-15 13:15:52.195	2025-08-15 13:15:52.195
64a7f6f1-037e-4dd9-9530-3f8c53d576e2	https://rakium.s3.us-east-005.backblazeb2.com/projects/69844e46-f13c-4620-b05f-fe5a521fcce8/gallery/1755263760852-des9joygwko.webp	\N	\N	3	69844e46-f13c-4620-b05f-fe5a521fcce8	2025-08-15 13:16:00.99	2025-08-15 13:16:00.99
9cf02e81-8159-46c9-8691-e5a71ee1f822	https://rakium.s3.us-east-005.backblazeb2.com/projects/69844e46-f13c-4620-b05f-fe5a521fcce8/gallery/1755263771873-kzjsz3gjuxi.webp	\N	\N	4	69844e46-f13c-4620-b05f-fe5a521fcce8	2025-08-15 13:16:11.91	2025-08-15 13:16:11.91
31baf2c6-6c0d-4133-8533-a400bed866e5	https://rakium.s3.us-east-005.backblazeb2.com/projects/69844e46-f13c-4620-b05f-fe5a521fcce8/gallery/1755263780285-j3aahhqyuxh.webp	\N	\N	5	69844e46-f13c-4620-b05f-fe5a521fcce8	2025-08-15 13:16:20.319	2025-08-15 13:16:20.319
768c5c62-8896-437a-8a2d-f04673dc16f6	https://rakium.s3.us-east-005.backblazeb2.com/projects/69844e46-f13c-4620-b05f-fe5a521fcce8/gallery/1755263787833-76na3im3vmm.webp	\N	\N	6	69844e46-f13c-4620-b05f-fe5a521fcce8	2025-08-15 13:16:27.883	2025-08-15 13:16:27.883
743c50f2-136a-40ea-8fe8-e59a81ae6929	https://rakium.s3.us-east-005.backblazeb2.com/projects/d28b5528-7e7b-4f49-9549-ee68e4a33a13/gallery/1754399317105-24idb2f9mxn.png	\N	\N	0	d28b5528-7e7b-4f49-9549-ee68e4a33a13	2025-08-05 13:08:37.143	2025-08-05 13:08:37.143
312c09fd-4d87-4dfc-b15b-62dfb3a66367	https://rakium.s3.us-east-005.backblazeb2.com/projects/d28b5528-7e7b-4f49-9549-ee68e4a33a13/gallery/1754399330478-rjrp0vdr8so.png	\N	\N	1	d28b5528-7e7b-4f49-9549-ee68e4a33a13	2025-08-05 13:08:50.733	2025-08-05 13:08:50.733
63968c36-dd67-4825-82c0-f8553833ba4e	https://rakium.s3.us-east-005.backblazeb2.com/projects/d28b5528-7e7b-4f49-9549-ee68e4a33a13/gallery/1754399343162-vqn1v5bd48q.png	\N	\N	2	d28b5528-7e7b-4f49-9549-ee68e4a33a13	2025-08-05 13:09:03.2	2025-08-05 13:09:03.2
50005cea-211b-45d0-9884-8e9641801db7	https://rakium.s3.us-east-005.backblazeb2.com/projects/d28b5528-7e7b-4f49-9549-ee68e4a33a13/gallery/1754399352480-kthhhj5xet.png	\N	\N	3	d28b5528-7e7b-4f49-9549-ee68e4a33a13	2025-08-05 13:09:12.573	2025-08-05 13:09:12.573
4c7ff28a-7b16-44fc-8940-97f7c8b26a4d	https://rakium.s3.us-east-005.backblazeb2.com/projects/d28b5528-7e7b-4f49-9549-ee68e4a33a13/gallery/1754399377221-y4dogon7h2j.png	\N	\N	4	d28b5528-7e7b-4f49-9549-ee68e4a33a13	2025-08-05 13:09:37.273	2025-08-05 13:09:37.273
5e2b8bc3-e164-4443-9439-102c1c301315	https://rakium.s3.us-east-005.backblazeb2.com/projects/d28b5528-7e7b-4f49-9549-ee68e4a33a13/gallery/1754399387846-kr1us0bpk9b.png	\N	\N	5	d28b5528-7e7b-4f49-9549-ee68e4a33a13	2025-08-05 13:09:47.882	2025-08-05 13:09:47.882
6baa2334-567a-4719-8416-92145544d5a8	https://rakium.s3.us-east-005.backblazeb2.com/projects/d28b5528-7e7b-4f49-9549-ee68e4a33a13/gallery/1754399396215-6sk8qwj4v2t.png	\N	\N	6	d28b5528-7e7b-4f49-9549-ee68e4a33a13	2025-08-05 13:09:56.425	2025-08-05 13:09:56.425
654d3e23-41dc-4675-ac3d-12a3a35d183e	https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/gallery/1754431345972-koghv41vx8l.png	\N	\N	8	3f7906e0-0023-400e-831b-f2f746ab64d9	2025-08-05 22:02:26.013	2025-08-05 22:02:26.013
c192e779-4264-44ca-82c9-7a2a72680fa4	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577392612-upke83zmg3.png	\N	\N	0	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:36:32.669	2025-08-07 14:36:32.669
4d3f940f-932f-41aa-a9b1-b75ded51b182	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577392600-nl1tdsw2d7n.png	\N	\N	0	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:36:32.694	2025-08-07 14:36:32.694
3e190f60-a71b-497e-b085-26819c70f8a2	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577392787-wlp1ce9eip.webp	\N	\N	0	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:36:33.309	2025-08-07 14:36:33.309
1212e04b-6f32-425d-b1fc-2f8267222ac9	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577531558-olqb0gkic7.png	\N	\N	1	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:38:51.608	2025-08-07 14:38:51.608
107efebb-b81e-44be-bf9c-b7a50c806e33	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577581421-czir8t996ve.png	\N	\N	5	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:39:41.471	2025-08-07 14:39:41.471
3caff237-b5ca-49d6-b94b-8c3c0d04f1af	https://rakium.s3.us-east-005.backblazeb2.com/projects/66f60329-e7fe-42c4-8c7b-c66f132c5ef1/gallery/1755521581383-f7uwnu72n8s.png	\N	\N	6	66f60329-e7fe-42c4-8c7b-c66f132c5ef1	2025-08-18 12:53:01.458	2025-08-18 12:53:01.458
81a46bcc-2500-452f-a66f-a543410ffb51	https://rakium.s3.us-east-005.backblazeb2.com/projects/66f60329-e7fe-42c4-8c7b-c66f132c5ef1/gallery/1755521581452-8wh492dbzqn.png	\N	\N	6	66f60329-e7fe-42c4-8c7b-c66f132c5ef1	2025-08-18 12:53:01.551	2025-08-18 12:53:01.551
da78e56d-5363-4279-b418-9ed2bc3adbef	https://rakium.s3.us-east-005.backblazeb2.com/projects/ecfb2cce-f5be-4233-bc4b-2c04fa70868a/gallery/1754656787886-6fo05qntx6g.webp	\N	\N	0	ecfb2cce-f5be-4233-bc4b-2c04fa70868a	2025-08-08 12:39:47.982	2025-08-08 12:39:47.982
125fbbc7-bbe4-4d52-9120-ec8eb8cd653c	https://rakium.s3.us-east-005.backblazeb2.com/projects/ecfb2cce-f5be-4233-bc4b-2c04fa70868a/gallery/1754656801202-ryq1uimmn7.png	\N	\N	1	ecfb2cce-f5be-4233-bc4b-2c04fa70868a	2025-08-08 12:40:01.278	2025-08-08 12:40:01.278
32825ea9-6288-48ad-a951-9418ff5316ea	https://rakium.s3.us-east-005.backblazeb2.com/projects/ecfb2cce-f5be-4233-bc4b-2c04fa70868a/gallery/1754656826535-qi8zx7kydxf.png	\N	\N	2	ecfb2cce-f5be-4233-bc4b-2c04fa70868a	2025-08-08 12:40:26.602	2025-08-08 12:40:26.602
89febb10-c544-4224-87e6-894f6ad2242c	https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/gallery/1754659391798-tp4wluphqpk.png	\N	\N	4	d1c6e99a-6159-4efe-a952-36926938529a	2025-08-08 13:23:11.847	2025-08-08 13:23:11.847
26719121-f62e-4c40-b04b-1fb2d77f512a	https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/gallery/1754659391802-8tgs68kw4he.png	\N	\N	4	d1c6e99a-6159-4efe-a952-36926938529a	2025-08-08 13:23:11.878	2025-08-08 13:23:11.878
96e9374c-74f6-495b-bf3f-db6036c30c0c	https://rakium.s3.us-east-005.backblazeb2.com/projects/72fb9387-0da5-4e8b-9dec-7e8f472cc710/gallery/1755006757130-r1ggmu7ff6i.png	\N	\N	2	72fb9387-0da5-4e8b-9dec-7e8f472cc710	2025-08-12 13:52:37.159	2025-08-12 13:52:37.159
e3b33105-2907-4719-92d3-9ecbacb1401d	https://rakium.s3.us-east-005.backblazeb2.com/projects/72fb9387-0da5-4e8b-9dec-7e8f472cc710/gallery/1755006757288-rlk9y56lh3l.webp	\N	\N	2	72fb9387-0da5-4e8b-9dec-7e8f472cc710	2025-08-12 13:52:37.315	2025-08-12 13:52:37.315
ce60e0d5-02b6-4644-afc7-946d646d0233	https://rakium.s3.us-east-005.backblazeb2.com/projects/72fb9387-0da5-4e8b-9dec-7e8f472cc710/gallery/1755006757276-7u63a3flgzq.webp	\N	\N	2	72fb9387-0da5-4e8b-9dec-7e8f472cc710	2025-08-12 13:52:37.625	2025-08-12 13:52:37.625
b671d813-0962-4a5a-b18b-33fa99fd347c	https://rakium.s3.us-east-005.backblazeb2.com/projects/67b049fa-ddce-4b9c-a955-0bf5ff07d597/gallery/1755176555115-5ef41ex25dp.png	\N	\N	0	67b049fa-ddce-4b9c-a955-0bf5ff07d597	2025-08-14 13:02:35.164	2025-08-14 13:02:35.164
f764dc0f-eb6c-4614-9562-5c73fe9b4d22	https://rakium.s3.us-east-005.backblazeb2.com/projects/67b049fa-ddce-4b9c-a955-0bf5ff07d597/gallery/1755176555107-it9m6agck8.png	\N	\N	0	67b049fa-ddce-4b9c-a955-0bf5ff07d597	2025-08-14 13:02:35.188	2025-08-14 13:02:35.188
0fe59705-36cf-4a25-b21d-233cb0f33a04	https://rakium.s3.us-east-005.backblazeb2.com/projects/67b049fa-ddce-4b9c-a955-0bf5ff07d597/gallery/1755176555353-101mm7oodqin.webp	\N	\N	1	67b049fa-ddce-4b9c-a955-0bf5ff07d597	2025-08-14 13:02:35.378	2025-08-14 13:02:35.378
978fc441-448c-415e-89c5-a30d53e346df	https://rakium.s3.us-east-005.backblazeb2.com/projects/67b049fa-ddce-4b9c-a955-0bf5ff07d597/gallery/1755176569205-8xl43gtrpg.png	\N	\N	2	67b049fa-ddce-4b9c-a955-0bf5ff07d597	2025-08-14 13:02:49.263	2025-08-14 13:02:49.263
9a542338-4bf8-4e00-bdb8-167bbb927399	https://rakium.s3.us-east-005.backblazeb2.com/projects/67b049fa-ddce-4b9c-a955-0bf5ff07d597/gallery/1755176569503-fff4c8bgk5.webp	\N	\N	3	67b049fa-ddce-4b9c-a955-0bf5ff07d597	2025-08-14 13:02:49.626	2025-08-14 13:02:49.626
617ec1f5-5666-4182-9485-f2e47bb47a58	https://rakium.s3.us-east-005.backblazeb2.com/projects/69844e46-f13c-4620-b05f-fe5a521fcce8/gallery/1755263796586-irgvl9od0ms.webp	\N	\N	7	69844e46-f13c-4620-b05f-fe5a521fcce8	2025-08-15 13:16:36.989	2025-08-15 13:16:36.989
7cf6f997-fcc6-4743-af3c-661096991caf	https://rakium.s3.us-east-005.backblazeb2.com/projects/69844e46-f13c-4620-b05f-fe5a521fcce8/gallery/1755263812343-fia2tm39s3v.webp	\N	\N	8	69844e46-f13c-4620-b05f-fe5a521fcce8	2025-08-15 13:16:52.459	2025-08-15 13:16:52.459
f73f8657-a2e8-4202-a1b6-159f0ebe64d2	https://rakium.s3.us-east-005.backblazeb2.com/projects/69844e46-f13c-4620-b05f-fe5a521fcce8/gallery/1755263812677-vtrteyzmn4o.png	\N	\N	9	69844e46-f13c-4620-b05f-fe5a521fcce8	2025-08-15 13:16:52.705	2025-08-15 13:16:52.705
39bae51e-6211-421b-9fd0-e3716a6bdc70	https://rakium.s3.us-east-005.backblazeb2.com/projects/d28b5528-7e7b-4f49-9549-ee68e4a33a13/gallery/1754399404935-lsnlebfo4aj.png	\N	\N	7	d28b5528-7e7b-4f49-9549-ee68e4a33a13	2025-08-05 13:10:04.997	2025-08-05 13:10:04.997
04814b2b-6530-4afa-af58-880fa2d78891	https://rakium.s3.us-east-005.backblazeb2.com/projects/d28b5528-7e7b-4f49-9549-ee68e4a33a13/gallery/1754399413264-pxnsz25rk6m.png	\N	\N	8	d28b5528-7e7b-4f49-9549-ee68e4a33a13	2025-08-05 13:10:13.312	2025-08-05 13:10:13.312
002a7110-cb9b-49e2-b9e4-05db9a2ecacc	https://rakium.s3.us-east-005.backblazeb2.com/projects/9154a62c-c500-41eb-8e48-053f81fc0310/gallery/1754406420857-k8oile7hcs.webp	\N	\N	0	9154a62c-c500-41eb-8e48-053f81fc0310	2025-08-05 15:07:01.148	2025-08-05 15:07:01.148
a1049704-ad5b-4992-8d15-c535447f6444	https://rakium.s3.us-east-005.backblazeb2.com/projects/9154a62c-c500-41eb-8e48-053f81fc0310/gallery/1754406428010-pj72vpta2r.webp	\N	\N	1	9154a62c-c500-41eb-8e48-053f81fc0310	2025-08-05 15:07:08.05	2025-08-05 15:07:08.05
af267700-66ff-4614-b9a4-40bd6ee22367	https://rakium.s3.us-east-005.backblazeb2.com/projects/9154a62c-c500-41eb-8e48-053f81fc0310/gallery/1754406447609-6zo12u1fuv6.webp	\N	\N	2	9154a62c-c500-41eb-8e48-053f81fc0310	2025-08-05 15:07:27.645	2025-08-05 15:07:27.645
c0d73194-e3d9-4612-a9a3-3ef8ad83a805	https://rakium.s3.us-east-005.backblazeb2.com/projects/9154a62c-c500-41eb-8e48-053f81fc0310/gallery/1754406460288-5iiehvwbax7.webp	\N	\N	3	9154a62c-c500-41eb-8e48-053f81fc0310	2025-08-05 15:07:40.459	2025-08-05 15:07:40.459
ec4a212e-1e3b-4574-9c2c-80b63472fce6	https://rakium.s3.us-east-005.backblazeb2.com/projects/9154a62c-c500-41eb-8e48-053f81fc0310/gallery/1754406485305-sdcsbgi01la.webp	\N	\N	4	9154a62c-c500-41eb-8e48-053f81fc0310	2025-08-05 15:08:05.391	2025-08-05 15:08:05.391
40a78822-41d8-4c82-aae2-06949fcdb80a	https://rakium.s3.us-east-005.backblazeb2.com/projects/9154a62c-c500-41eb-8e48-053f81fc0310/gallery/1754406498400-zjdisfhz51.png	\N	\N	5	9154a62c-c500-41eb-8e48-053f81fc0310	2025-08-05 15:08:18.458	2025-08-05 15:08:18.458
d55ac901-7002-4366-8c4b-0bdd6a921df2	https://rakium.s3.us-east-005.backblazeb2.com/projects/9154a62c-c500-41eb-8e48-053f81fc0310/gallery/1754406516364-4j1tzstdd3.png	\N	\N	6	9154a62c-c500-41eb-8e48-053f81fc0310	2025-08-05 15:08:36.4	2025-08-05 15:08:36.4
cbd7f333-d1b9-49da-bc78-7ac56e0057f1	https://rakium.s3.us-east-005.backblazeb2.com/projects/9154a62c-c500-41eb-8e48-053f81fc0310/gallery/1754406525663-9vn7krogizd.png	\N	\N	7	9154a62c-c500-41eb-8e48-053f81fc0310	2025-08-05 15:08:45.707	2025-08-05 15:08:45.707
fd46bb55-24e2-452e-9010-42a4d339e8c2	https://rakium.s3.us-east-005.backblazeb2.com/projects/afcac270-0a3d-4ab9-adb8-01c8dc6d8f08/gallery/1754407604303-gl1msgegabo.webp	\N	\N	0	afcac270-0a3d-4ab9-adb8-01c8dc6d8f08	2025-08-05 15:26:44.691	2025-08-05 15:26:44.691
416d8fbb-1d70-4a15-b976-0cfaa3761afd	https://rakium.s3.us-east-005.backblazeb2.com/projects/afcac270-0a3d-4ab9-adb8-01c8dc6d8f08/gallery/1754407612446-kww4hh9qrb.png	\N	\N	1	afcac270-0a3d-4ab9-adb8-01c8dc6d8f08	2025-08-05 15:26:52.499	2025-08-05 15:26:52.499
72630208-9964-42d0-9dbe-11285ccfd42c	https://rakium.s3.us-east-005.backblazeb2.com/projects/afcac270-0a3d-4ab9-adb8-01c8dc6d8f08/gallery/1754407624914-ih1cs465ujb.webp	\N	\N	2	afcac270-0a3d-4ab9-adb8-01c8dc6d8f08	2025-08-05 15:27:04.966	2025-08-05 15:27:04.966
d17ac275-d167-4e3c-a302-492c1b7085bc	https://rakium.s3.us-east-005.backblazeb2.com/projects/afcac270-0a3d-4ab9-adb8-01c8dc6d8f08/gallery/1754407640273-3ui8gvojwbf.webp	\N	\N	3	afcac270-0a3d-4ab9-adb8-01c8dc6d8f08	2025-08-05 15:27:20.382	2025-08-05 15:27:20.382
cba5645d-4cf1-42cd-aa6e-82d4a0bda133	https://rakium.s3.us-east-005.backblazeb2.com/projects/afcac270-0a3d-4ab9-adb8-01c8dc6d8f08/gallery/1754407649395-vgesj6z6d8b.webp	\N	\N	4	afcac270-0a3d-4ab9-adb8-01c8dc6d8f08	2025-08-05 15:27:29.486	2025-08-05 15:27:29.486
440feb4e-b669-4a23-8002-41d602cbb529	https://rakium.s3.us-east-005.backblazeb2.com/projects/afcac270-0a3d-4ab9-adb8-01c8dc6d8f08/gallery/1754407659310-yw2fodtvzi.png	\N	\N	5	afcac270-0a3d-4ab9-adb8-01c8dc6d8f08	2025-08-05 15:27:39.352	2025-08-05 15:27:39.352
0cfbe562-0e35-42ec-a08a-1cae99ded4b4	https://rakium.s3.us-east-005.backblazeb2.com/projects/afcac270-0a3d-4ab9-adb8-01c8dc6d8f08/gallery/1754407667698-p4xdoa8ndf.webp	\N	\N	6	afcac270-0a3d-4ab9-adb8-01c8dc6d8f08	2025-08-05 15:27:47.956	2025-08-05 15:27:47.956
06787db8-f749-48d9-8cec-eb2e311c3d40	https://rakium.s3.us-east-005.backblazeb2.com/projects/afcac270-0a3d-4ab9-adb8-01c8dc6d8f08/gallery/1754407674668-dqv5sjemyj8.png	\N	\N	7	afcac270-0a3d-4ab9-adb8-01c8dc6d8f08	2025-08-05 15:27:54.755	2025-08-05 15:27:54.755
2c14713b-83da-4f05-a75e-1b68c268740f	https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/gallery/1754426394810-3gmip0vk8tj.png	\N	\N	0	01ba64eb-9e22-4c43-8e78-834bdaab0edc	2025-08-05 20:39:54.872	2025-08-05 20:39:54.872
f6e90969-1fbf-4ad0-b200-9ef5726e38ac	https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/gallery/1754426394983-phuzk36j51.webp	\N	\N	0	01ba64eb-9e22-4c43-8e78-834bdaab0edc	2025-08-05 20:39:55.022	2025-08-05 20:39:55.022
d3e7d8b7-1b8a-4096-bb2d-bb4bdcd029e5	https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/gallery/1754426395015-iqxase46dym.webp	\N	\N	0	01ba64eb-9e22-4c43-8e78-834bdaab0edc	2025-08-05 20:39:55.058	2025-08-05 20:39:55.058
fc7d34ad-039c-4194-b1d1-a25fae3d2c02	https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/gallery/1754426431814-diw5rny06eu.png	\N	\N	1	01ba64eb-9e22-4c43-8e78-834bdaab0edc	2025-08-05 20:40:31.872	2025-08-05 20:40:31.872
2dbd80d4-de1b-4548-89ee-fc0d93f99dc2	https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/gallery/1754426431988-w15wsh3aetk.webp	\N	\N	1	01ba64eb-9e22-4c43-8e78-834bdaab0edc	2025-08-05 20:40:32.063	2025-08-05 20:40:32.063
d823cf08-44aa-4338-87c5-811025af5c41	https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/gallery/1754426431950-dijlwewm5ws.webp	\N	\N	1	01ba64eb-9e22-4c43-8e78-834bdaab0edc	2025-08-05 20:40:32.084	2025-08-05 20:40:32.084
61efb74f-e1b1-40cc-a54c-7b55a6cfeae0	https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/gallery/1754426484406-hojv9j51eg.png	\N	\N	2	01ba64eb-9e22-4c43-8e78-834bdaab0edc	2025-08-05 20:41:24.461	2025-08-05 20:41:24.461
7938f2b8-fab7-4f90-9fd7-e92bf37edf0e	https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/gallery/1754426484480-w5su3446eam.png	\N	\N	3	01ba64eb-9e22-4c43-8e78-834bdaab0edc	2025-08-05 20:41:24.526	2025-08-05 20:41:24.526
3d46581f-8b1d-48ae-8895-6d4163bc1933	https://rakium.s3.us-east-005.backblazeb2.com/projects/4efb76cc-8404-47eb-aced-d8d620041cf1/gallery/1754519428568-w4ftuwewtce.png	\N	\N	0	4efb76cc-8404-47eb-aced-d8d620041cf1	2025-08-06 22:30:28.626	2025-08-06 22:30:28.626
9681f614-287d-47cc-a0cc-9ccb3457a301	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577531682-d1yx1fvtngo.png	\N	\N	2	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:38:51.726	2025-08-07 14:38:51.726
7d8695dc-b51d-4e59-a892-ee9954547392	https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/gallery/1754426588538-rc8k9ynynn.webp	\N	\N	4	01ba64eb-9e22-4c43-8e78-834bdaab0edc	2025-08-05 20:43:08.674	2025-08-05 20:43:08.674
1c769101-f4f0-437b-886b-9ae00a4fea90	https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/gallery/1754426588742-q3kdv9mv78o.webp	\N	\N	4	01ba64eb-9e22-4c43-8e78-834bdaab0edc	2025-08-05 20:43:08.765	2025-08-05 20:43:08.765
8ba32da4-5c97-4d9f-98e5-a25596fb18f3	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/gallery/1754428036778-g0sdwdm3v0u.png	\N	\N	0	8345c571-e32e-473d-b431-35ef81468dae	2025-08-05 21:07:16.858	2025-08-05 21:07:16.858
e613cc97-9d59-46e2-87f5-222f7e52adbd	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/gallery/1754428052758-7ae0tmtx8fl.png	\N	\N	1	8345c571-e32e-473d-b431-35ef81468dae	2025-08-05 21:07:32.807	2025-08-05 21:07:32.807
fe83832d-d4c6-4e30-a85a-9ed389499744	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/gallery/1754428067266-8ylz9m3jpre.webp	\N	\N	2	8345c571-e32e-473d-b431-35ef81468dae	2025-08-05 21:07:47.338	2025-08-05 21:07:47.338
85df7507-9309-482e-8c9d-9601a1a32783	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/gallery/1754428080970-f6kx8fitz7.webp	\N	\N	3	8345c571-e32e-473d-b431-35ef81468dae	2025-08-05 21:08:01.059	2025-08-05 21:08:01.059
bd0b6aa7-3afc-4db1-975f-5fa318807a2e	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/gallery/1754428100631-1s639mi4967.png	\N	\N	4	8345c571-e32e-473d-b431-35ef81468dae	2025-08-05 21:08:20.783	2025-08-05 21:08:20.783
dec219d9-fe44-4a0a-96e6-4318dde7b14f	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/gallery/1754428113884-udoeeqih01h.png	\N	\N	5	8345c571-e32e-473d-b431-35ef81468dae	2025-08-05 21:08:34.006	2025-08-05 21:08:34.006
f09e198a-df42-40c7-a87e-b9414bd9b385	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/gallery/1754428122293-pnyhga1m66c.png	\N	\N	6	8345c571-e32e-473d-b431-35ef81468dae	2025-08-05 21:08:42.344	2025-08-05 21:08:42.344
9e8c8548-ab20-474e-ae2d-c71abfcd9174	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/gallery/1754428131326-eij9m1c39v4.png	\N	\N	7	8345c571-e32e-473d-b431-35ef81468dae	2025-08-05 21:08:51.407	2025-08-05 21:08:51.407
a28db46d-d446-4c92-bade-c5c8ae5861c9	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/gallery/1754428140962-naxikvk0rr.png	\N	\N	8	8345c571-e32e-473d-b431-35ef81468dae	2025-08-05 21:09:01.062	2025-08-05 21:09:01.062
924b7a55-63c0-4a29-84be-1d44250531dd	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/gallery/1754428165848-wo9it9a1hq.webp	\N	\N	9	8345c571-e32e-473d-b431-35ef81468dae	2025-08-05 21:09:25.891	2025-08-05 21:09:25.891
18f681a4-c58c-44e7-82fb-95a42070d2a4	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/gallery/1754428165953-a1m0sb2srvn.webp	\N	\N	9	8345c571-e32e-473d-b431-35ef81468dae	2025-08-05 21:09:25.977	2025-08-05 21:09:25.977
81edff20-6117-418c-97c6-34e61b67e84f	https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/gallery/1754571543722-024asamtdnmo.png	\N	\N	0	b6d17043-de1b-42d0-bd2e-12f738cb314b	2025-08-07 12:59:03.776	2025-08-07 12:59:03.776
e04c084f-0cf1-410c-bd9b-75e1f5d3265d	https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/gallery/1754571543850-rniybtd6n6.png	\N	\N	1	b6d17043-de1b-42d0-bd2e-12f738cb314b	2025-08-07 12:59:03.908	2025-08-07 12:59:03.908
157a1cb9-b59d-4e9b-9c1a-b70aaadf7f50	https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/gallery/1754571562338-7rvuqie5ejv.png	\N	\N	2	b6d17043-de1b-42d0-bd2e-12f738cb314b	2025-08-07 12:59:22.38	2025-08-07 12:59:22.38
ac64904e-9a50-4b44-a591-813d1c7bc3e0	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577531818-jm61q2s8hyh.webp	\N	\N	2	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:38:51.895	2025-08-07 14:38:51.895
86d755c9-c3f0-4ef9-a487-0e09580fb9de	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577531677-nue846gmluq.png	\N	\N	2	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:38:51.925	2025-08-07 14:38:51.925
11aa2875-9e58-4ff8-91ba-307ee8b64ecd	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577552900-4vju76g6ass.webp	\N	\N	3	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:39:13.037	2025-08-07 14:39:13.037
2d7acc34-f103-4ccd-badf-8df973bda539	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577562648-rciodsnbeja.png	\N	\N	4	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:39:22.697	2025-08-07 14:39:22.697
daa6fe23-f929-493a-910f-53cfc769576d	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/gallery/1754577581428-3k8hrnvkd8n.png	\N	\N	5	5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	2025-08-07 14:39:41.48	2025-08-07 14:39:41.48
f541fb60-02c0-4c27-b1f7-2dbb46718da4	https://rakium.s3.us-east-005.backblazeb2.com/projects/ecfb2cce-f5be-4233-bc4b-2c04fa70868a/gallery/1754656826662-03u1amv5ebu6.png	\N	\N	3	ecfb2cce-f5be-4233-bc4b-2c04fa70868a	2025-08-08 12:40:26.696	2025-08-08 12:40:26.696
79896fcf-bedf-4068-aae2-57e0179d6686	https://rakium.s3.us-east-005.backblazeb2.com/projects/ecfb2cce-f5be-4233-bc4b-2c04fa70868a/gallery/1754656826681-7wrebzm7u5u.png	\N	\N	3	ecfb2cce-f5be-4233-bc4b-2c04fa70868a	2025-08-08 12:40:26.744	2025-08-08 12:40:26.744
51f0e1f9-16ec-4d0d-a789-a4d8ad086b05	https://rakium.s3.us-east-005.backblazeb2.com/projects/ecfb2cce-f5be-4233-bc4b-2c04fa70868a/gallery/1754656840252-iuix63g345.png	\N	\N	4	ecfb2cce-f5be-4233-bc4b-2c04fa70868a	2025-08-08 12:40:40.332	2025-08-08 12:40:40.332
253b1943-6ceb-49fd-a317-5832a025049f	https://rakium.s3.us-east-005.backblazeb2.com/projects/ecfb2cce-f5be-4233-bc4b-2c04fa70868a/gallery/1754656853289-jb8gacwiab.png	\N	\N	5	ecfb2cce-f5be-4233-bc4b-2c04fa70868a	2025-08-08 12:40:53.333	2025-08-08 12:40:53.333
1bdb853b-ff9e-44ba-a375-286f1afccf44	https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/gallery/1754923584266-48wkp1os8dq.png	\N	\N	0	e3abc867-1e4e-4197-a587-b1f81c21aba5	2025-08-11 14:46:24.321	2025-08-11 14:46:24.321
0b85cc75-3d28-439e-b435-281240ceeab6	https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/gallery/1754923610791-dyfcrwo9bqq.png	\N	\N	2	e3abc867-1e4e-4197-a587-b1f81c21aba5	2025-08-11 14:46:50.824	2025-08-11 14:46:50.824
adf074de-3d30-4559-ae39-e51dadfdf35a	https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/gallery/1754923610799-1z0hntw4yaj.png	\N	\N	2	e3abc867-1e4e-4197-a587-b1f81c21aba5	2025-08-11 14:46:50.847	2025-08-11 14:46:50.847
746676ad-1bcc-4eca-8894-bcd8f32b5ac0	https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/gallery/1754923634726-rfx77k5skj.png	\N	\N	3	e3abc867-1e4e-4197-a587-b1f81c21aba5	2025-08-11 14:47:14.772	2025-08-11 14:47:14.772
33d60016-fdd6-4606-99eb-0ffc18d15289	https://rakium.s3.us-east-005.backblazeb2.com/projects/72fb9387-0da5-4e8b-9dec-7e8f472cc710/gallery/1755006786892-l5ijsd5bjv.png	\N	\N	3	72fb9387-0da5-4e8b-9dec-7e8f472cc710	2025-08-12 13:53:06.936	2025-08-12 13:53:06.936
1288c30e-916b-40cc-a9a9-2ff078261156	https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/gallery/1755525974467-rqvmt5xix8e.png	\N	\N	1	af3d72b4-ad85-48e8-a047-75457ed31786	2025-08-18 14:06:14.517	2025-08-18 14:06:14.517
f497df38-d53b-4371-b51c-5fa243201851	https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/gallery/1755525974599-fc529k1gr5f.png	\N	\N	2	af3d72b4-ad85-48e8-a047-75457ed31786	2025-08-18 14:06:14.628	2025-08-18 14:06:14.628
cd431ee0-f13b-4321-8d26-4a729ac71ff4	https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/gallery/1755526815092-yl0t5ooq9th.png	\N	\N	3	af3d72b4-ad85-48e8-a047-75457ed31786	2025-08-18 14:20:15.16	2025-08-18 14:20:15.16
fb4d06be-9f6d-493f-922b-9ec4f8654536	https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/gallery/1755526815228-kxztjms5yt.png	\N	\N	4	af3d72b4-ad85-48e8-a047-75457ed31786	2025-08-18 14:20:15.269	2025-08-18 14:20:15.269
133036ef-4889-42fd-ba75-c738bc25f9a4	https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/gallery/1755526815298-8ygumumb7uw.png	\N	\N	5	af3d72b4-ad85-48e8-a047-75457ed31786	2025-08-18 14:20:15.339	2025-08-18 14:20:15.339
7c916169-1013-4363-8dde-fc40bef76579	https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/gallery/1755526816224-wbucvu04it.webp	\N	\N	6	af3d72b4-ad85-48e8-a047-75457ed31786	2025-08-18 14:20:16.336	2025-08-18 14:20:16.336
8b2454fd-6a06-4280-b7b0-1ae533cff8c6	https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/gallery/1755526896672-aef7maqzxw8.png	\N	\N	7	af3d72b4-ad85-48e8-a047-75457ed31786	2025-08-18 14:21:36.716	2025-08-18 14:21:36.716
19a8cc44-091d-42a8-b545-101b4ae4dea3	https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/gallery/1755526897067-jcki83hj9gi.png	\N	\N	8	af3d72b4-ad85-48e8-a047-75457ed31786	2025-08-18 14:21:37.097	2025-08-18 14:21:37.097
9d61a39c-542e-41b1-a659-c3bd18719459	https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/gallery/1755526897086-lqjpxyoc4ks.png	\N	\N	8	af3d72b4-ad85-48e8-a047-75457ed31786	2025-08-18 14:21:37.171	2025-08-18 14:21:37.171
de0e1ee0-8784-43fc-b8a9-b71059800bf3	https://rakium.s3.us-east-005.backblazeb2.com/projects/575112a7-5407-4e47-b7c0-a958a4a532f1/gallery/1755614437900-rtq7n3bjkm.png	\N	\N	0	575112a7-5407-4e47-b7c0-a958a4a532f1	2025-08-19 14:40:37.947	2025-08-19 14:40:37.947
8bac046a-e6b6-47cc-865c-9fb0be457511	https://rakium.s3.us-east-005.backblazeb2.com/projects/575112a7-5407-4e47-b7c0-a958a4a532f1/gallery/1755614437896-90saxve42cw.webp	\N	\N	0	575112a7-5407-4e47-b7c0-a958a4a532f1	2025-08-19 14:40:37.963	2025-08-19 14:40:37.963
343fa48e-fd55-4932-ab62-fc794fbd6677	https://rakium.s3.us-east-005.backblazeb2.com/projects/575112a7-5407-4e47-b7c0-a958a4a532f1/gallery/1755614500532-61b5xeklxb.webp	\N	\N	1	575112a7-5407-4e47-b7c0-a958a4a532f1	2025-08-19 14:41:40.571	2025-08-19 14:41:40.571
3929500b-eba2-42ef-af4c-898624eebfe6	https://rakium.s3.us-east-005.backblazeb2.com/projects/575112a7-5407-4e47-b7c0-a958a4a532f1/gallery/1755614500762-rcuer57mj7q.webp	\N	\N	2	575112a7-5407-4e47-b7c0-a958a4a532f1	2025-08-19 14:41:40.788	2025-08-19 14:41:40.788
741b5846-b98d-494d-a8d8-e91c87c61f9a	https://rakium.s3.us-east-005.backblazeb2.com/projects/575112a7-5407-4e47-b7c0-a958a4a532f1/gallery/1755614500883-l3sy4jbq9oe.webp	\N	\N	2	575112a7-5407-4e47-b7c0-a958a4a532f1	2025-08-19 14:41:40.907	2025-08-19 14:41:40.907
ce9bb632-3562-4bda-b258-2721a02714cd	https://rakium.s3.us-east-005.backblazeb2.com/projects/575112a7-5407-4e47-b7c0-a958a4a532f1/gallery/1755614501155-gl4vvjqlhoa.webp	\N	\N	3	575112a7-5407-4e47-b7c0-a958a4a532f1	2025-08-19 14:41:41.181	2025-08-19 14:41:41.181
bf7a94b1-ba67-488d-b9e6-2e6f982c1ab4	https://rakium.s3.us-east-005.backblazeb2.com/projects/575112a7-5407-4e47-b7c0-a958a4a532f1/gallery/1755614543079-ga8wqm0jbv.webp	\N	\N	4	575112a7-5407-4e47-b7c0-a958a4a532f1	2025-08-19 14:42:23.299	2025-08-19 14:42:23.299
c62c9eef-b687-46d6-9012-afd1d6f86e50	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/gallery/1755617473955-mziiy5zypck.webp	\N	\N	0	6783d0c2-bbcb-42f0-9a16-fd30eace28f8	2025-08-19 15:31:13.998	2025-08-19 15:31:13.998
7de54de2-5201-459f-807a-9ee8ee2f08c8	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/gallery/1755617473946-f6unte3yop5.webp	\N	\N	0	6783d0c2-bbcb-42f0-9a16-fd30eace28f8	2025-08-19 15:31:14.019	2025-08-19 15:31:14.019
32203d83-140d-4710-a790-a9682b0014ee	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/gallery/1755617474008-fmwyr6kmnat.webp	\N	\N	0	6783d0c2-bbcb-42f0-9a16-fd30eace28f8	2025-08-19 15:31:14.123	2025-08-19 15:31:14.123
a7098d47-f185-4a54-9126-bc00135f9ecc	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/gallery/1755617503428-b5247zgucmd.webp	\N	\N	1	6783d0c2-bbcb-42f0-9a16-fd30eace28f8	2025-08-19 15:31:43.527	2025-08-19 15:31:43.527
abcc93c4-bb45-4f22-a8ed-d2a76c66ba32	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/gallery/1755617503353-5irgiqx0gsi.webp	\N	\N	1	6783d0c2-bbcb-42f0-9a16-fd30eace28f8	2025-08-19 15:31:43.61	2025-08-19 15:31:43.61
62957f50-b3a1-45c2-8fbb-bc412dc6a02d	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/gallery/1755617503458-2vadclnpwlm.webp	\N	\N	1	6783d0c2-bbcb-42f0-9a16-fd30eace28f8	2025-08-19 15:31:43.634	2025-08-19 15:31:43.634
6f6bcc42-f05c-4978-8148-8cc857957262	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/gallery/1755617503388-i81e3w24y9l.webp	\N	\N	1	6783d0c2-bbcb-42f0-9a16-fd30eace28f8	2025-08-19 15:31:43.994	2025-08-19 15:31:43.994
3908f71f-e3b8-43ad-ab38-0a07da639021	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/gallery/1755617533897-w08q7jz010k.webp	\N	\N	2	6783d0c2-bbcb-42f0-9a16-fd30eace28f8	2025-08-19 15:32:13.998	2025-08-19 15:32:13.998
e7e91b93-5e32-4058-8370-e0c4520bb102	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/gallery/1755617563578-ej4uzhlxsb7.webp	\N	\N	3	6783d0c2-bbcb-42f0-9a16-fd30eace28f8	2025-08-19 15:32:43.632	2025-08-19 15:32:43.632
6376dbf7-c614-4dca-9d1d-1d6ab969fd36	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/gallery/1755617563551-0ikj1029w7ib.webp	\N	\N	3	6783d0c2-bbcb-42f0-9a16-fd30eace28f8	2025-08-19 15:32:43.665	2025-08-19 15:32:43.665
863e0db8-2765-46bc-b20c-6f56ffef6220	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/gallery/1755617563230-vobpycsjj5p.webp	\N	\N	3	6783d0c2-bbcb-42f0-9a16-fd30eace28f8	2025-08-19 15:32:43.669	2025-08-19 15:32:43.669
fac33e3c-8027-4cbc-8e52-092d7105174a	https://rakium.s3.us-east-005.backblazeb2.com/projects/e0fa1310-c458-415a-b706-b9439a96137d/gallery/1756124355265-upouv940e5.webp	\N	\N	3	e0fa1310-c458-415a-b706-b9439a96137d	2025-08-25 12:19:15.319	2025-08-25 12:33:09.227
e656bf4a-3b4a-4852-9bd8-9277aec72f0b	https://rakium.s3.us-east-005.backblazeb2.com/projects/e0fa1310-c458-415a-b706-b9439a96137d/gallery/1756124354657-heb8g6698h9.webp	\N	\N	4	e0fa1310-c458-415a-b706-b9439a96137d	2025-08-25 12:19:14.749	2025-08-25 12:33:09.227
636d87b8-c122-4dc6-821d-a6ccef23c00b	https://rakium.s3.us-east-005.backblazeb2.com/projects/e0fa1310-c458-415a-b706-b9439a96137d/gallery/1756124355258-le0egzeafjk.webp	\N	\N	5	e0fa1310-c458-415a-b706-b9439a96137d	2025-08-25 12:19:15.56	2025-08-25 12:33:09.227
821df0b2-4287-497a-83c9-4dda660d45a8	https://rakium.s3.us-east-005.backblazeb2.com/projects/e8621808-b969-4b29-abdb-6d7aea021f05/gallery/1756130032932-jwvge7h34v.webp	\N	\N	10	e8621808-b969-4b29-abdb-6d7aea021f05	2025-08-25 13:53:52.972	2025-08-25 13:55:11.751
c42b389c-977b-4f78-b57e-2d8e5409d177	https://rakium.s3.us-east-005.backblazeb2.com/projects/e8621808-b969-4b29-abdb-6d7aea021f05/gallery/1756130032730-e7teewet6j.webp	\N	\N	5	e8621808-b969-4b29-abdb-6d7aea021f05	2025-08-25 13:53:53.012	2025-08-25 13:55:11.751
223c36bb-00d0-4dd8-a9db-647d59ab1365	https://rakium.s3.us-east-005.backblazeb2.com/projects/10364348-fa40-446e-aefb-c1a802db8559/gallery/1756128230319-bsqsg1wos99.webp	\N	\N	2	10364348-fa40-446e-aefb-c1a802db8559	2025-08-25 13:23:50.572	2025-08-25 13:24:34.44
15747934-6d94-4c92-9e42-ed28e6ffbdc9	https://rakium.s3.us-east-005.backblazeb2.com/projects/10364348-fa40-446e-aefb-c1a802db8559/gallery/1756128230414-lbtlgz8fuh.webp	\N	\N	3	10364348-fa40-446e-aefb-c1a802db8559	2025-08-25 13:23:50.444	2025-08-25 13:24:34.44
b2ac90a6-80e2-4690-87cd-74b4f43ef1f6	https://rakium.s3.us-east-005.backblazeb2.com/projects/10364348-fa40-446e-aefb-c1a802db8559/gallery/1756128230614-8zsr8yayaax.webp	\N	\N	4	10364348-fa40-446e-aefb-c1a802db8559	2025-08-25 13:23:50.731	2025-08-25 13:24:34.44
40f5014a-fa81-420a-aea8-27afdf050c04	https://rakium.s3.us-east-005.backblazeb2.com/projects/e0fa1310-c458-415a-b706-b9439a96137d/gallery/1756124354815-hk4snbqqb2n.webp	\N	\N	0	e0fa1310-c458-415a-b706-b9439a96137d	2025-08-25 12:19:15.069	2025-08-25 12:33:09.227
03f4fdd6-0d18-4db5-bb4f-2a69243004bf	https://rakium.s3.us-east-005.backblazeb2.com/projects/e0fa1310-c458-415a-b706-b9439a96137d/gallery/1756124355314-suw8k4644iq.webp	\N	\N	1	e0fa1310-c458-415a-b706-b9439a96137d	2025-08-25 12:19:15.396	2025-08-25 12:33:09.227
8900f2fa-4607-4ec5-b834-8ee9d76599bd	https://rakium.s3.us-east-005.backblazeb2.com/projects/e0fa1310-c458-415a-b706-b9439a96137d/gallery/1756124355274-ytxu9f6ws5o.webp	\N	\N	2	e0fa1310-c458-415a-b706-b9439a96137d	2025-08-25 12:19:15.546	2025-08-25 12:33:09.227
f29dd325-ca37-4877-b5fd-c0f1aae8c209	https://rakium.s3.us-east-005.backblazeb2.com/projects/e8621808-b969-4b29-abdb-6d7aea021f05/gallery/1756130032893-fw4hq4ns85w.webp	\N	\N	6	e8621808-b969-4b29-abdb-6d7aea021f05	2025-08-25 13:53:52.948	2025-08-25 13:55:11.751
312fed9c-7ac5-40bb-b5f7-3849dc50dbd4	https://rakium.s3.us-east-005.backblazeb2.com/projects/e8621808-b969-4b29-abdb-6d7aea021f05/gallery/1756130032953-zi2h6uib48p.webp	\N	\N	7	e8621808-b969-4b29-abdb-6d7aea021f05	2025-08-25 13:53:53.056	2025-08-25 13:55:11.751
b4e5d17a-0700-44c1-9959-bf4e34fa481c	https://rakium.s3.us-east-005.backblazeb2.com/projects/10364348-fa40-446e-aefb-c1a802db8559/gallery/1756128230611-4axqnanvoxx.webp	\N	\N	5	10364348-fa40-446e-aefb-c1a802db8559	2025-08-25 13:23:50.638	2025-08-25 13:24:34.44
e95d1c57-6c7f-4106-af7f-5011de697f04	https://rakium.s3.us-east-005.backblazeb2.com/projects/10364348-fa40-446e-aefb-c1a802db8559/gallery/1756128230615-7ykgazcu02n.webp	\N	\N	6	10364348-fa40-446e-aefb-c1a802db8559	2025-08-25 13:23:50.775	2025-08-25 13:24:34.44
3e9434dd-e136-46c2-b2b8-70999fc6ed43	https://rakium.s3.us-east-005.backblazeb2.com/projects/10364348-fa40-446e-aefb-c1a802db8559/gallery/1756128230207-w9um5jalyc.webp	\N	\N	7	10364348-fa40-446e-aefb-c1a802db8559	2025-08-25 13:23:50.285	2025-08-25 13:24:34.44
921baa47-66ed-4667-8a80-5c66d8cbcab8	https://rakium.s3.us-east-005.backblazeb2.com/projects/10364348-fa40-446e-aefb-c1a802db8559/gallery/1756128229949-yxpp1rnvwy.webp	\N	\N	8	10364348-fa40-446e-aefb-c1a802db8559	2025-08-25 13:23:50.491	2025-08-25 13:24:34.44
827b24f2-5954-4380-a1eb-408b2f25a2d8	https://rakium.s3.us-east-005.backblazeb2.com/projects/10364348-fa40-446e-aefb-c1a802db8559/gallery/1756128228982-5aylk2pda4h.webp	\N	\N	0	10364348-fa40-446e-aefb-c1a802db8559	2025-08-25 13:23:49.486	2025-08-25 13:24:34.44
0ef844b2-a337-47d9-9366-1d4b6e212baf	https://rakium.s3.us-east-005.backblazeb2.com/projects/10364348-fa40-446e-aefb-c1a802db8559/gallery/1756128230266-cu4qrl5bu5.webp	\N	\N	1	10364348-fa40-446e-aefb-c1a802db8559	2025-08-25 13:23:50.331	2025-08-25 13:24:34.44
be5f37d1-34e0-46bc-9a59-5a436634df51	https://rakium.s3.us-east-005.backblazeb2.com/projects/e8621808-b969-4b29-abdb-6d7aea021f05/gallery/1756130033120-sf3wzlvcuk.webp	\N	\N	9	e8621808-b969-4b29-abdb-6d7aea021f05	2025-08-25 13:53:53.171	2025-08-25 13:55:11.751
bdfe46b2-2abe-48c8-ad51-e706d7d54afa	https://rakium.s3.us-east-005.backblazeb2.com/projects/e8621808-b969-4b29-abdb-6d7aea021f05/gallery/1756130033144-s4v2vjo23d.webp	\N	\N	0	e8621808-b969-4b29-abdb-6d7aea021f05	2025-08-25 13:53:53.192	2025-08-25 13:55:11.751
690b807d-89dc-4e19-b6ad-0f07909aa37a	https://rakium.s3.us-east-005.backblazeb2.com/projects/e8621808-b969-4b29-abdb-6d7aea021f05/gallery/1756130033192-x60tkbdr48.webp	\N	\N	1	e8621808-b969-4b29-abdb-6d7aea021f05	2025-08-25 13:53:53.236	2025-08-25 13:55:11.751
572d46d5-9759-49f5-8a30-507dbb1354ed	https://rakium.s3.us-east-005.backblazeb2.com/projects/e8621808-b969-4b29-abdb-6d7aea021f05/gallery/1756130033109-2933sswf6k.webp	\N	\N	2	e8621808-b969-4b29-abdb-6d7aea021f05	2025-08-25 13:53:53.219	2025-08-25 13:55:11.751
918a361b-3415-4f4e-8c70-6c6f3c26ba55	https://rakium.s3.us-east-005.backblazeb2.com/projects/e8621808-b969-4b29-abdb-6d7aea021f05/gallery/1756130033133-fvqeupdi7c.webp	\N	\N	3	e8621808-b969-4b29-abdb-6d7aea021f05	2025-08-25 13:53:53.163	2025-08-25 13:55:11.751
a043abc8-a83f-4f7f-92b5-f304d2ae90ce	https://rakium.s3.us-east-005.backblazeb2.com/projects/e8621808-b969-4b29-abdb-6d7aea021f05/gallery/1756130033141-05u52unht0mb.webp	\N	\N	4	e8621808-b969-4b29-abdb-6d7aea021f05	2025-08-25 13:53:53.191	2025-08-25 13:55:11.751
ab5b4f4d-c6f7-4d15-80cb-6dc74437667e	https://rakium.s3.us-east-005.backblazeb2.com/projects/e8621808-b969-4b29-abdb-6d7aea021f05/gallery/1756130032978-p4zfskvm1q.webp	\N	\N	8	e8621808-b969-4b29-abdb-6d7aea021f05	2025-08-25 13:53:53.089	2025-08-25 13:55:11.751
\.


--
-- TOC entry 3426 (class 0 OID 26993)
-- Dependencies: 216
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, "passwordHash", role, "clientId", "createdAt", "updatedAt") FROM stdin;
b30fcd88-d394-45db-9cff-0303af84dc2b	admin@rakium.com	$2b$10$sKmhzaSyNIjIf18JVvIwTeJOVNB/XpsSwkagMCt8xkgOBdxgoGtme	ADMIN	\N	2025-06-19 19:48:11.332	2025-06-19 19:48:11.332
01128c96-86ff-4995-b610-1c91bbcdf6e6	kamakdesarrollos@gmail.com	$2b$10$DGGrRmrKNapG1B96woxzpOoK6L2Rhl87vqbvVozW8Guzv3d5ZrGFu	CLIENT	78abe353-1728-49b0-b268-1d2ad5786317	2025-06-22 22:42:39.142	2025-06-22 22:42:39.142
d285fe94-7957-4559-a97c-acb6acb7316f	vicmano@gmail.com	$2b$10$rhpMcmdnZPMPzMw9KoW/tehloVZVtyHsplRIhKIO4HbjCKYVQ/Ttu	CLIENT	bd70958e-483b-483d-b490-17987441855d	2025-07-18 00:05:28	2025-07-18 00:05:28
b66f8de1-71f8-40d7-867e-23b058182ad4	administracion@kamak.com.ar	$2b$10$WPX9PYwr4K5yqj80CD5Lhec1ZEDBqz/qSTZeYtPPsI.hN9g/OSVD2	CLIENT	78abe353-1728-49b0-b268-1d2ad5786317	2025-07-18 11:19:46	2025-07-18 11:19:46
36fa3c19-d40f-41b1-a57d-ec17bf84c7c5	direccion@kamak.com.ar	$2b$10$PR00.sH7Sjw2Zfty14T36.dJXH7x7SjNLHAhv7Y72.FdD3k6NavfW	CLIENT	78abe353-1728-49b0-b268-1d2ad5786317	2025-07-18 11:19:55	2025-07-18 11:19:55
6cb7f64c-aa0c-4b32-9c1f-42311e2fa505	usuario@cliente.com	$2b$10$ONdg31c4H15ZHl10mc823eXy.ceoxS0KoRufMcgRxOcyOkoxMzyI6	CLIENT	62c089a2-ad4c-4735-a2bd-234b20a8d0e2	2025-08-05 18:50:50.635	2025-08-05 18:50:50.635
75c3b32b-c221-45d4-977b-8af91dd3836b	landicandela01@gmail.com	$2b$10$ry0YaoM9MjqLoI5QiybeJ.UXexogmDyDE2YdL44zSpGHL0eKemBtm	CLIENT	88b59ed0-4d52-45db-bd21-ef72a8338fbc	2025-08-09 15:03:05.224	2025-08-09 15:03:05.224
e3c33190-816a-46b4-b30f-e358b8493582	rakium.root@gmail.com	$2b$10$jDcm6NvhcR.uNiy0NbVXl.MnHTFp8qX87QBpGKq8cyoxl7OUBfTY6	CLIENT	a49284fc-c5cc-471e-a4f7-1fb71925c1e3	2025-09-22 14:21:29.449	2025-09-22 14:21:29.449
\.


--
-- TOC entry 3430 (class 0 OID 28811)
-- Dependencies: 220
-- Data for Name: Video; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Video" (id, title, description, youtube_url, "order", "projectId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3425 (class 0 OID 26953)
-- Dependencies: 215
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c1b82743-157e-44f8-bcee-16fd95ec96ba	5789b7b223a7e4184c182c61879d65e02267ba35e4936e56e3aac9b5292c942f	2025-06-19 19:47:47.44599+00	20250604000500_init	\N	\N	2025-06-19 19:47:46.536371+00	1
4bf37fc4-0d0b-4db7-9a28-567add0be77c	e43e86f7e91c1cb5ea9a2b7e29cf0bb5e510454a7d9e42b542038f0774dabcf4	2025-06-19 19:47:48.611476+00	20250604000903_rename_timestamp_columns	\N	\N	2025-06-19 19:47:47.775353+00	1
e514f8ea-6f52-4bcf-9bdc-e74074cf270b	da250e3ae6d2a2f4a8f6f6859b0afa0384ff96372610b401568ee7c24605923a	2025-06-19 19:47:49.797838+00	20250604134542_make_project_fields_optional	\N	\N	2025-06-19 19:47:48.963457+00	1
448a2cb0-bfa2-433e-9b35-3bf15cffed1b	a4eba6be6409bd9eca28e9004d4961da3bed1508726ad7ab0b91fae4369fd4b4	2025-06-19 19:48:07.990663+00	20250619194806_fix_schema_sync	\N	\N	2025-06-19 19:48:07.143606+00	1
3d80555a-d37c-4185-89b7-59b8fb0a75db	501b0d16a8aa40d2b53885f8270a11489d657bccf5b34e32a733fd507070505f	2025-06-19 20:57:59.995891+00	20250619205758_make_category_optional	\N	\N	2025-06-19 20:57:59.218556+00	1
cfffa86d-200d-468a-80b6-2f357697b8c1	f28ed6958e965467f66fa587a3c985e4e8dc915974e46542a5a444cb6e4db205	2025-06-20 17:40:24.556968+00	20250620174022_add_start_date_end_date_fields	\N	\N	2025-06-20 17:40:23.716821+00	1
464b1f85-5bf2-4bb6-bb8f-63de45805747	90e3b03e0d6dac50f816e0cc75d3220e39043ef9ca72551e5e5d8c68a00a175a	2025-06-20 19:48:00.822853+00	20250620194759_add_video_model	\N	\N	2025-06-20 19:47:59.935617+00	1
0d443a65-ffba-4f31-9410-7d1f606e15d8	dc143420e327e03afa6f6c4bd151a4a49965b0d0fe0b446b8701e34c35d0b796	2025-06-29 18:10:17.280662+00	20250629181015_update_address_to_json	\N	\N	2025-06-29 18:10:16.500535+00	1
207610cf-74d6-4432-83b3-de9b1b2da052	bfae7d0ff94bbf2eb77848835b824e56ace37247aa2a399dca72d27284a0f74e	2025-07-05 19:11:32.168389+00	20250705191130_add_internal_project_fields	\N	\N	2025-07-05 19:11:31.301615+00	1
627063e7-bf6e-476b-983d-e9e9f172669d	487db4f206b6712d5b057b4d35ea08e784e1d092b3e0a9b3b5b0a1eb805e5343	2025-07-19 18:04:05.268742+00	20250719180403_add_project_order_field	\N	\N	2025-07-19 18:04:04.410339+00	1
8882c594-cc84-4e3e-af69-7d077b763b6b	8e555f6e3b46e49c5c2878f30325697f62ad79ce5fc7a37c78423e94998d590a	2025-08-17 19:03:43.556122+00	20250817190313_add_github_demo_technologies_fields	\N	\N	2025-08-17 19:03:42.714473+00	1
79d6f1d9-41b2-4551-977b-0c05ba51ad68	1c9e810316806c6824381959b149d6ed23f883128db3cf8042d1a44b1a0b25b5	2026-01-26 18:11:08.965895+00	20260126151038_add_donations_model	\N	\N	2026-01-26 18:11:08.048152+00	1
\.


--
-- TOC entry 3429 (class 0 OID 27237)
-- Dependencies: 219
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, name, type, status, category, description, long_description, image_before, image_after, latitude, longitude, country, state, city, area, duration, date, url, client_id, challenge, solution, created_at, updated_at, before_image_id, after_image_id, "createdBy", end_date, start_date, address, budget, contact_email, contact_name, contact_phone, invoice_status, notes, "order", demo_url, github_url, technologies) FROM stdin;
5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5	Mar del Plata - Tienda 14	\N	PUBLISHED	TIENDAS			https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/large/1754577340348-s4ahz2lc7fl.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/5a34b3f0-1dc8-4831-8b84-3d7df9e3afb5/large/1754577370786-kjjy8r1dqwo.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-07 14:34:44.989	2025-10-25 15:48:41.781	\N	\N	\N	\N	\N	{"lat": -38.0054771, "lng": -57.5426106, "address": "Mar del Plata, Provincia de Buenos Aires, Argentina"}							3	\N	\N	\N
d1c6e99a-6159-4efe-a952-36926938529a	Necochea - Tienda 19	\N	PUBLISHED	TIENDAS			https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/large/1754659294014-ijhcffv7r0e.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/d1c6e99a-6159-4efe-a952-36926938529a/large/1754659305469-vpurg5vt4ei.jpeg	\N	\N	\N	\N	\N	350 m²	33 días	\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-08 13:21:24.592	2025-10-25 15:48:53.973	\N	\N	\N	2024-03-24 03:00:00	2024-02-20 03:00:00	{"lat": -38.5669676, "lng": -58.73902880000001, "address": "Av. 42 3703, B7630 Necochea, Provincia de Buenos Aires, Argentina"}							6	\N	\N	\N
6783d0c2-bbcb-42f0-9a16-fd30eace28f8	Haedo - Tienda 17	\N	PUBLISHED	\N			\N	https://rakium.s3.us-east-005.backblazeb2.com/projects/6783d0c2-bbcb-42f0-9a16-fd30eace28f8/large/1755617864828-pxxne8dfkzn.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-19 15:30:37.587	2025-08-19 15:38:28.45	\N	\N	\N	\N	\N	{"lat": -34.6440676, "lng": -58.59564279999999, "address": "B1706 Haedo, Provincia de Buenos Aires, Argentina"}							10	\N	\N	\N
e0fa1310-c458-415a-b706-b9439a96137d	JC Cosmetology	LANDING	DRAFT	\N	Landing page para un profesional de la estética. \n\nLideré el diseño, desarrollo e implementación de principio a fin, entregando una experiencia limpia, elegante y responsiva que muestra claramente los servicios y facilita el contacto.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	88b59ed0-4d52-45db-bd21-ef72a8338fbc	\N	\N	2025-08-24 14:36:19.374	2025-09-02 18:50:28.535	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	https://jc-cosmetology.com/	\N	["Angular", "TypeScript", "Tailwind Css"]
2e4d4712-45d1-45ac-88a9-5e81ce855be2	Proyecto Ejemplo	LANDING	PUBLISHED	ESTACIONES	Remodelación completa de estación de servicio	Proyecto integral de remodelación incluyendo área de conveniencia y restaurante	https://ejemplo.com/antes.jpg	https://ejemplo.com/despues.jpg	19.4326	-99.1332	México	Ciudad de México	Benito Juárez	500m²	3 meses	2024-03-15	https://ejemplo.com/proyecto1	62c089a2-ad4c-4735-a2bd-234b20a8d0e2	Mantener operaciones durante la remodelación	Trabajo por fases y horarios especiales	2025-08-17 22:39:28.12	2025-08-17 22:39:28.12	\N	\N	b30fcd88-d394-45db-9cff-0303af84dc2b	\N	\N	"Av. Insurgentes Sur 1602, Ciudad de México"	\N	\N	\N	\N	\N	\N	0	\N	\N	\N
3f7906e0-0023-400e-831b-f2f746ab64d9	Bahía Blanca - Tienda 11	\N	PUBLISHED	\N			https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/large/1754430708669-o2hrvseg3va.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/3f7906e0-0023-400e-831b-f2f746ab64d9/large/1754430750781-8xc13zogn3v.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-05 21:50:57.711	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -38.7183177, "lng": -62.2663478, "address": "Bahía Blanca, Provincia de Buenos Aires, Argentina"}							12	\N	\N	\N
e3abc867-1e4e-4197-a587-b1f81c21aba5	Rojas - Tienda 20	\N	PUBLISHED	\N			https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/large/1754923833571-fx91j0qojb8.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/e3abc867-1e4e-4197-a587-b1f81c21aba5/large/1754923876717-6rpwktyynza.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-11 14:44:47.31	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -34.1982461, "lng": -60.7336641, "address": "Rojas, Provincia de Buenos Aires, Argentina"}							106	\N	\N	\N
49914e9c-688d-4081-afa7-f26172da85e0	Proyecto Ejemplo	LANDING	PUBLISHED	ESTACIONES	Remodelación completa de estación de servicio	Proyecto integral de remodelación incluyendo área de conveniencia y restaurante	https://ejemplo.com/antes.jpg	https://ejemplo.com/despues.jpg	19.4326	-99.1332	México	Ciudad de México	Benito Juárez	500m²	3 meses	2024-03-15	https://ejemplo.com/proyecto1	62c089a2-ad4c-4735-a2bd-234b20a8d0e2	Mantener operaciones durante la remodelación	Trabajo por fases y horarios especiales	2025-08-05 18:50:50.653	2025-08-05 18:50:50.653	\N	\N	b30fcd88-d394-45db-9cff-0303af84dc2b	\N	\N	"Av. Insurgentes Sur 1602, Ciudad de México"	\N	\N	\N	\N	\N	\N	0	\N	\N	\N
8345c571-e32e-473d-b431-35ef81468dae	Rosario - Tienda 10	\N	PUBLISHED	\N			\N	https://rakium.s3.us-east-005.backblazeb2.com/projects/8345c571-e32e-473d-b431-35ef81468dae/large/1754428014861-5al7rkwdvb7.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-05 21:06:46.573	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -32.9587022, "lng": -60.69304159999999, "address": "Rosario, Santa Fe, Argentina"}							40	\N	\N	\N
54b60f9b-6ee0-4f9b-8556-33f0aee2e274	Moquehua - Tienda 29	\N	PUBLISHED	\N			\N	https://rakium.s3.us-east-005.backblazeb2.com/projects/54b60f9b-6ee0-4f9b-8556-33f0aee2e274/large/1755523260496-sqamb6cxbs.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-18 13:12:09.195	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -35.0900903, "lng": -59.7743765, "address": "Moquehuá, Provincia de Buenos Aires, Argentina"}							19	\N	\N	\N
b6d17043-de1b-42d0-bd2e-12f738cb314b	Olavarría - Tienda 13	\N	PUBLISHED	\N			https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/large/1754571496991-yql71cq498h.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/b6d17043-de1b-42d0-bd2e-12f738cb314b/large/1754571513785-lsuzj6u1mdi.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-07 12:55:33.022	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -36.8937167, "lng": -60.32334989999999, "address": "Olavarría, Provincia de Buenos Aires, Argentina"}							20	\N	\N	\N
d9bd8b8e-8a3c-4100-8fcc-c68ac87dec4f	Proyecto Ejemplo	LANDING	PUBLISHED	ESTACIONES	Remodelación completa de estación de servicio	Proyecto integral de remodelación incluyendo área de conveniencia y restaurante	https://ejemplo.com/antes.jpg	https://ejemplo.com/despues.jpg	19.4326	-99.1332	México	Ciudad de México	Benito Juárez	500m²	3 meses	2024-03-15	https://ejemplo.com/proyecto1	62c089a2-ad4c-4735-a2bd-234b20a8d0e2	Mantener operaciones durante la remodelación	Trabajo por fases y horarios especiales	2025-08-17 22:39:48.328	2025-08-17 22:39:48.328	\N	\N	b30fcd88-d394-45db-9cff-0303af84dc2b	\N	\N	"Av. Insurgentes Sur 1602, Ciudad de México"	\N	\N	\N	\N	\N	\N	0	\N	\N	\N
10364348-fa40-446e-aefb-c1a802db8559	ONG Valores para la familia	CUSTOM	DRAFT	\N	Sitio web desarrollado para una organización no gubernamental dedicada a la prevención del abuso sexual infantil. El proyecto incluye un diseño moderno y responsivo con enfoque en la accesibilidad y la facilidad de navegación. La plataforma presenta información educativa, recursos de prevención y canales de contacto para familias y profesionales que trabajan con niños.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	88b59ed0-4d52-45db-bd21-ef72a8338fbc	\N	\N	2025-08-25 12:34:03.023	2025-09-02 18:49:13.477	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	https://valoresparalafamilia.com	\N	["Angular", "TypeScript", "Tailwind CSS"]
ecfb2cce-f5be-4233-bc4b-2c04fa70868a	Zarate Traslux - Tienda 18	\N	PUBLISHED	TIENDAS			https://rakium.s3.us-east-005.backblazeb2.com/projects/ecfb2cce-f5be-4233-bc4b-2c04fa70868a/large/1754656750928-zxehx7bpvcq.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/ecfb2cce-f5be-4233-bc4b-2c04fa70868a/large/1754656764738-mgaikk9qf2a.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-08 12:37:21.443	2025-10-25 15:51:45.578	\N	\N	\N	\N	\N	{"lat": -34.0951512, "lng": -59.0240826, "address": "Zárate, Provincia de Buenos Aires, Argentina"}							8	\N	\N	\N
e8621808-b969-4b29-abdb-6d7aea021f05	Kamak Desarrollos	CUSTOM	DRAFT	\N	Sitio institucional desarrollado para una empresa de construcción. El sistema incluye una plataforma de gestión interna con login y autenticación mediante JWT, donde los administradores acceden a un dashboard privado para cargar, editar y eliminar proyectos (CRUD). El panel permite filtrar, buscar por nombre, gestionar información interna, imágenes y videos. Los proyectos se visualizan en un mapa interactivo integrado con Google Maps, utilizando las APIs de Google Places y Geolocation.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	88b59ed0-4d52-45db-bd21-ef72a8338fbc	\N	\N	2025-08-25 13:28:27.092	2025-09-02 18:48:32.719	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	https://kamak.com.ar	\N	["Angular 19", "TypeScript", "Nest Js", "Prisma", "PostgreSql", "Google Maps API", "Angular Material"]
afcac270-0a3d-4ab9-adb8-01c8dc6d8f08	Tres Arroyos Ruta 3 - Tienda 08	\N	PUBLISHED	TIENDAS			\N	https://rakium.s3.us-east-005.backblazeb2.com/projects/afcac270-0a3d-4ab9-adb8-01c8dc6d8f08/large/1754407576403-6px9i598fz.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-07-31 15:41:08.554	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -38.3775437, "lng": -60.27522949999999, "address": "Tres Arroyos, Provincia de Buenos Aires, Argentina"}							35	\N	\N	\N
03f385b8-9dd8-40ae-ab49-e0178f78b123	Proyecto Ejemplo	LANDING	PUBLISHED	ESTACIONES	Remodelación completa de estación de servicio	Proyecto integral de remodelación incluyendo área de conveniencia y restaurante	https://ejemplo.com/antes.jpg	https://ejemplo.com/despues.jpg	19.4326	-99.1332	México	Ciudad de México	Benito Juárez	500m²	3 meses	2024-03-15	https://ejemplo.com/proyecto1	62c089a2-ad4c-4735-a2bd-234b20a8d0e2	Mantener operaciones durante la remodelación	Trabajo por fases y horarios especiales	2025-10-02 06:04:35.924	2025-10-02 06:04:35.924	\N	\N	b30fcd88-d394-45db-9cff-0303af84dc2b	\N	\N	"Av. Insurgentes Sur 1602, Ciudad de México"	\N	\N	\N	\N	\N	\N	0	\N	\N	\N
6b3b5fb1-5b42-4f33-b612-72c9a2512d4e	San Martin - Tienda 15	\N	PUBLISHED	\N			https://rakium.s3.us-east-005.backblazeb2.com/projects/6b3b5fb1-5b42-4f33-b612-72c9a2512d4e/large/1754580659285-syk53n8xh28.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/6b3b5fb1-5b42-4f33-b612-72c9a2512d4e/large/1754580672857-6o1vc32nlb6.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-07 15:30:09.75	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -34.5757521, "lng": -58.53709649999999, "address": "B1650 San Martín, Provincia de Buenos Aires, Argentina"}							36	\N	\N	\N
6f7156a1-6134-4614-bb73-d8a7eb942ce6	Garín - Tienda 25	\N	PUBLISHED	\N			https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/large/1755186399597-2jtiyogoxfw.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/6f7156a1-6134-4614-bb73-d8a7eb942ce6/large/1755186415986-2q73blvvm9.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-14 14:21:17.38	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -34.4207886, "lng": -58.7400175, "address": "Garin, Provincia de Buenos Aires, Argentina"}							27	\N	\N	\N
d28b5528-7e7b-4f49-9549-ee68e4a33a13	Lobería - Tienda 05	\N	PUBLISHED	ESTACIONES			\N	https://rakium.s3.us-east-005.backblazeb2.com/projects/d28b5528-7e7b-4f49-9549-ee68e4a33a13/large/1754399484947-4wa2ueqn45n.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-07-31 15:20:40.693	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -38.1635434, "lng": -58.78295989999999, "address": "Lobería, Provincia de Buenos Aires, Argentina"}							16	\N	\N	\N
01ba64eb-9e22-4c43-8e78-834bdaab0edc	Azul Sapeda - Tienda 09	\N	PUBLISHED	\N			https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/large/1754426344313-twykaorgjx.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/01ba64eb-9e22-4c43-8e78-834bdaab0edc/large/1754426283032-18frwoqdjs8.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-05 20:35:57.241	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -36.7780207, "lng": -59.8585778, "address": "Azul, Provincia de Buenos Aires, Argentina"}							11	\N	\N	\N
705f4dae-a77f-420e-9f80-edfb5e2dae26	El Talar - Tienda 23	\N	PUBLISHED	\N			\N	https://rakium.s3.us-east-005.backblazeb2.com/projects/705f4dae-a77f-420e-9f80-edfb5e2dae26/large/1755090774290-w1hcqxs5wv.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-13 13:07:58.629	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -34.4720967, "lng": -58.6540206, "address": "El Talar, Provincia de Buenos Aires, Argentina"}							13	\N	\N	\N
66f60329-e7fe-42c4-8c7b-c66f132c5ef1	San Clemente del tuyu - Tienda 27	\N	PUBLISHED	TIENDAS			https://rakium.s3.us-east-005.backblazeb2.com/projects/66f60329-e7fe-42c4-8c7b-c66f132c5ef1/large/1753968028727-gfoef9rd58h.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/66f60329-e7fe-42c4-8c7b-c66f132c5ef1/large/1755520875087-2lwr7288t8f.jpeg	\N	\N	\N	\N	\N	100 m²	7 días	\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-07-31 13:17:25.141	2025-08-19 15:33:19.12	\N	\N	\N	2024-12-19 03:00:00	2024-12-12 03:00:00	{"lat": -36.3590676, "lng": -56.728856, "address": "Av. San Martín 795, B7105 San Clemente del Tuyu, Provincia de Buenos Aires, Argentina"}			Sebastian Cupo	2215485936			18	\N	\N	\N
575112a7-5407-4e47-b7c0-a958a4a532f1	San Bernardo - Tienda 3	\N	PUBLISHED	\N			\N	https://rakium.s3.us-east-005.backblazeb2.com/projects/575112a7-5407-4e47-b7c0-a958a4a532f1/large/1755614525903-abwm94kksav.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-19 14:37:22.528	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -36.6863655, "lng": -56.6791979, "address": "San Bernardo del Tuyú, Provincia de Buenos Aires, Argentina"}							24	\N	\N	\N
72fb9387-0da5-4e8b-9dec-7e8f472cc710	Mar del Plata - Tienda 21	\N	PUBLISHED	TIENDAS			https://rakium.s3.us-east-005.backblazeb2.com/projects/72fb9387-0da5-4e8b-9dec-7e8f472cc710/large/1755007035035-hncpxhr0p1s.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/72fb9387-0da5-4e8b-9dec-7e8f472cc710/large/1755007058102-3xnk3kdx0uq.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-12 13:39:29.847	2025-10-25 15:48:35.508	\N	\N	\N	\N	\N	{"lat": -38.0054771, "lng": -57.5426106, "address": "Mar del Plata, Provincia de Buenos Aires, Argentina"}							5	\N	\N	\N
af3d72b4-ad85-48e8-a047-75457ed31786	Baradero - Tienda 30	\N	PUBLISHED	COMERCIALES	awd		https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/large/1750710991015-9lrueyhzsco.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/af3d72b4-ad85-48e8-a047-75457ed31786/large/1755525938214-3pee8d9eyw8.jpeg	\N	\N	\N	\N	\N	520 m²	44 días	\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-06-23 20:35:21.013	2025-10-25 15:49:10.109	\N	\N	\N	2025-07-25 03:00:00	2025-06-11 03:00:00	{"lat": -33.8126983, "lng": -59.5044264, "address": "Baradero, Buenos Aires Province, Argentina"}					Pendiente		7	\N	\N	\N
9154a62c-c500-41eb-8e48-053f81fc0310	Tandil - Tienda 06	\N	PUBLISHED	TIENDAS			https://rakium.s3.us-east-005.backblazeb2.com/projects/9154a62c-c500-41eb-8e48-053f81fc0310/large/1753975341988-ocaw8fer46.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/9154a62c-c500-41eb-8e48-053f81fc0310/large/1754406386587-es24ocu238s.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-07-31 15:22:04.667	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -37.3287999, "lng": -59.1367167, "address": "Tandil, Provincia de Buenos Aires, Argentina"}							37	\N	\N	\N
4efb76cc-8404-47eb-aced-d8d620041cf1	La Tablada-Tienda 12	\N	PUBLISHED	\N			https://rakium.s3.us-east-005.backblazeb2.com/projects/4efb76cc-8404-47eb-aced-d8d620041cf1/large/1754519406442-skwahjzipbk.jpeg	https://rakium.s3.us-east-005.backblazeb2.com/projects/4efb76cc-8404-47eb-aced-d8d620041cf1/large/1754519416915-78ktu6ozloj.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-06 22:29:54.7	2025-08-19 15:33:19.12	\N	\N	\N	\N	\N	{"lat": -34.6855199, "lng": -58.53200299999999, "address": "La Tablada, Provincia de Buenos Aires, Argentina"}							47	\N	\N	\N
69844e46-f13c-4620-b05f-fe5a521fcce8	Las Toninas - Tienda 26	\N	PUBLISHED	\N			\N	https://rakium.s3.us-east-005.backblazeb2.com/projects/69844e46-f13c-4620-b05f-fe5a521fcce8/large/1755618169356-5hjt91n3gb9.jpeg	\N	\N	\N	\N	\N	300 m²	43 días	\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-15 12:38:23.802	2025-08-19 15:42:59.04	\N	\N	\N	2025-07-25 03:00:00	2025-06-12 03:00:00	{"lat": -36.4875929, "lng": -56.693458, "address": "Las Toninas, Provincia de Buenos Aires, Argentina"}							17	\N	\N	\N
67b049fa-ddce-4b9c-a955-0bf5ff07d597	30 de Agosto - Tienda 24	\N	PUBLISHED	\N			\N	https://rakium.s3.us-east-005.backblazeb2.com/projects/67b049fa-ddce-4b9c-a955-0bf5ff07d597/large/1755176579582-ovw2rof2c7e.jpeg	\N	\N	\N	\N	\N			\N	\N	78abe353-1728-49b0-b268-1d2ad5786317			2025-08-14 13:02:04.37	2025-08-20 11:55:29.842	\N	\N	\N	\N	\N	{"lat": -36.2787436, "lng": -62.5450728, "address": "30 de Agosto, Provincia de Buenos Aires, Argentina"}							15	\N	\N	\N
\.


--
-- TOC entry 3263 (class 2606 OID 27008)
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- TOC entry 3273 (class 2606 OID 33459)
-- Name: Donation Donation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_pkey" PRIMARY KEY (id);


--
-- TOC entry 3265 (class 2606 OID 27027)
-- Name: Gallery Gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Gallery"
    ADD CONSTRAINT "Gallery_pkey" PRIMARY KEY (id);


--
-- TOC entry 3260 (class 2606 OID 27000)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3271 (class 2606 OID 28819)
-- Name: Video Video_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Video"
    ADD CONSTRAINT "Video_pkey" PRIMARY KEY (id);


--
-- TOC entry 3257 (class 2606 OID 26961)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3269 (class 2606 OID 27245)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 3261 (class 1259 OID 27029)
-- Name: Client_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Client_email_key" ON public."Client" USING btree (email);


--
-- TOC entry 3274 (class 1259 OID 33460)
-- Name: Donation_transaction_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Donation_transaction_id_key" ON public."Donation" USING btree (transaction_id);


--
-- TOC entry 3258 (class 1259 OID 27028)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 3266 (class 1259 OID 27247)
-- Name: projects_after_image_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX projects_after_image_id_key ON public.projects USING btree (after_image_id);


--
-- TOC entry 3267 (class 1259 OID 27246)
-- Name: projects_before_image_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX projects_before_image_id_key ON public.projects USING btree (before_image_id);


--
-- TOC entry 3276 (class 2606 OID 27268)
-- Name: Gallery Gallery_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Gallery"
    ADD CONSTRAINT "Gallery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3275 (class 2606 OID 27030)
-- Name: User User_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3281 (class 2606 OID 28820)
-- Name: Video Video_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Video"
    ADD CONSTRAINT "Video_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3277 (class 2606 OID 27258)
-- Name: projects projects_after_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_after_image_id_fkey FOREIGN KEY (after_image_id) REFERENCES public."Gallery"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3278 (class 2606 OID 27253)
-- Name: projects projects_before_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_before_image_id_fkey FOREIGN KEY (before_image_id) REFERENCES public."Gallery"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3279 (class 2606 OID 27248)
-- Name: projects projects_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3280 (class 2606 OID 27263)
-- Name: projects projects_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2026-01-27 20:14:49 -03

--
-- PostgreSQL database dump complete
--

\unrestrict EXmJ1A3g9vODJyQnRIdiPScLqn0Ors1NfpEPQ1xeEXx2cfQmwtSw9YrK5IdSN9d

