USE [Finex]
GO

/****** Object: Table [dbo].[ACCOUNT_RECEIVABLE_DESC] Script Date: 1/9/2024 1:56:41 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ACCOUNT_RECEIVABLE_DESC] (
    [ID]           INT            IDENTITY (1, 1) NOT NULL,
    [ARID]         INT            NULL,
    [AMOUNT]       MONEY          NULL,
    [DESCRIPTION]  NTEXT          NULL,
    [QUANTITY]     NVARCHAR (10)  NULL,
    [PRICEPERUNIT] MONEY          NULL,
    [UNIT]         NVARCHAR (50)  NULL,
    [CUSTOMERID]   INT            NULL,
    [SAC]          NVARCHAR (6)   NULL,
    [IHAC]         NVARCHAR (12)  NULL,
    [LINEBALANCE]  MONEY          NULL,
    [CACID]        INT            NULL,
    [RECEIVED]     MONEY          NULL,
    [CREATEDBY]    NVARCHAR (300) NULL,
    [CREATEDDATE]  DATETIME       NULL,
    [MODIFIEDBY]   NVARCHAR (300) NULL,
    [MODIFIEDDATE] DATETIME       NULL
);


