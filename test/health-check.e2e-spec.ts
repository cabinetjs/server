import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import * as request from 'supertest'

import { HealthCheckModule } from '@/health-check/health-check.module'

describe('HealthCheckController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthCheckModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  describe('/ping (GET)', () => {
    it('should return "pong"', async () => {
      const response = await request(app.getHttpServer())
        .get('/ping')
        .expect(200)

      expect(response.text).toBe('pong')
    })
  })
})
