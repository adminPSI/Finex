USE [Finex]
GO

/****** Object: Table [dbo].[IHPOAPPROVAL] Script Date: 1/11/2024 4:22:06 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].REVENUE_RECEIVABLE_APPROVAL (
    [ID]                 INT            IDENTITY (1, 1) NOT NULL,
    REF_ID              INT            NULL,
    ACCOUNTTYPE  NVARCHAR (500) NULL,
    APPROVED_DATE     DateTime            NULL,
    [REQ_STATUS]         BIT            NULL,
    [REQ_STATUS_MESSAGE] NVARCHAR (MAX) NULL,
    [CREATEDBY]          NVARCHAR (MAX) NULL,
    [CREATEDDATE]        DATETIME       NULL,
    [MODIFIEDBY]         NVARCHAR (MAX) NULL,
    [MODIFIEDDATE]       DATETIME       NULL,
    [REQ_COMMENT]        NVARCHAR (MAX) NULL
);


