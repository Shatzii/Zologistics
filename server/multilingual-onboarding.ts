/**
 * Multilingual Onboarding System
 * Seamless signup process supporting Spanish, Portuguese, and German
 * Designed for Central America and EU market expansion
 */

export interface OnboardingTranslations {
  [key: string]: {
    [languageCode: string]: string;
  };
}

export interface OnboardingStep {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  fields: OnboardingField[];
  validation: ValidationRule[];
  order: number;
  region?: 'north_america' | 'central_america' | 'european_union';
}

export interface OnboardingField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'file' | 'date';
  label: Record<string, string>;
  placeholder: Record<string, string>;
  options?: Array<{ value: string; label: Record<string, string> }>;
  required: boolean;
  validation?: RegExp;
  helpText?: Record<string, string>;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'phone' | 'length' | 'custom';
  params?: any;
  message: Record<string, string>;
}

export interface OnboardingProgress {
  userId: string;
  currentStep: number;
  completedSteps: string[];
  language: string;
  region: string;
  userData: Record<string, any>;
  startedAt: Date;
  lastUpdated: Date;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface RegionalRequirements {
  region: string;
  requiredDocuments: string[];
  complianceSteps: string[];
  localizations: {
    currency: string;
    dateFormat: string;
    phoneFormat: string;
    addressFormat: string[];
  };
}

export class MultilingualOnboardingSystem {
  private onboardingSteps: Map<string, OnboardingStep> = new Map();
  private userProgress: Map<string, OnboardingProgress> = new Map();
  private regionalRequirements: Map<string, RegionalRequirements> = new Map();
  private translations: OnboardingTranslations = {};

  constructor() {
    this.initializeTranslations();
    this.initializeOnboardingSteps();
    this.initializeRegionalRequirements();
    console.log('🌍 Multilingual Onboarding System initialized');
    console.log('📝 Supporting Spanish, Portuguese, and German for global expansion');
  }

  private initializeTranslations() {
    this.translations = {
      // Welcome and Basic Information
      'welcome_title': {
        'en': 'Welcome to TruckFlow AI',
        'es': 'Bienvenido a TruckFlow AI',
        'pt': 'Bem-vindo ao TruckFlow AI',
        'de': 'Willkommen bei TruckFlow AI'
      },
      'welcome_subtitle': {
        'en': 'Join the world\'s most advanced trucking platform',
        'es': 'Únete a la plataforma de transporte más avanzada del mundo',
        'pt': 'Junte-se à plataforma de transporte mais avançada do mundo',
        'de': 'Treten Sie der fortschrittlichsten Transportplattform der Welt bei'
      },
      'personal_info_title': {
        'en': 'Personal Information',
        'es': 'Información Personal',
        'pt': 'Informações Pessoais',
        'de': 'Persönliche Informationen'
      },
      'first_name': {
        'en': 'First Name',
        'es': 'Nombre',
        'pt': 'Nome',
        'de': 'Vorname'
      },
      'last_name': {
        'en': 'Last Name',
        'es': 'Apellido',
        'pt': 'Sobrenome',
        'de': 'Nachname'
      },
      'email_address': {
        'en': 'Email Address',
        'es': 'Dirección de Correo',
        'pt': 'Endereço de Email',
        'de': 'E-Mail-Adresse'
      },
      'phone_number': {
        'en': 'Phone Number',
        'es': 'Número de Teléfono',
        'pt': 'Número de Telefone',
        'de': 'Telefonnummer'
      },

      // Driver Information
      'driver_info_title': {
        'en': 'Driver Information',
        'es': 'Información del Conductor',
        'pt': 'Informações do Motorista',
        'de': 'Fahrerinformationen'
      },
      'cdl_number': {
        'en': 'CDL Number',
        'es': 'Número de Licencia Comercial',
        'pt': 'Número da CNH Categoria E',
        'de': 'LKW-Führerschein Nummer'
      },
      'experience_years': {
        'en': 'Years of Experience',
        'es': 'Años de Experiencia',
        'pt': 'Anos de Experiência',
        'de': 'Jahre Erfahrung'
      },
      'equipment_type': {
        'en': 'Equipment Type',
        'es': 'Tipo de Equipo',
        'pt': 'Tipo de Equipamento',
        'de': 'Fahrzeugtyp'
      },

      // Equipment Options
      'dry_van': {
        'en': 'Dry Van',
        'es': 'Furgón Seco',
        'pt': 'Baú Seco',
        'de': 'Trockenauflieger'
      },
      'refrigerated': {
        'en': 'Refrigerated',
        'es': 'Refrigerado',
        'pt': 'Refrigerado',
        'de': 'Kühlauflieger'
      },
      'flatbed': {
        'en': 'Flatbed',
        'es': 'Plataforma',
        'pt': 'Prancha',
        'de': 'Pritsche'
      },
      'step_deck': {
        'en': 'Step Deck',
        'es': 'Plataforma Baja',
        'pt': 'Prancha Rebaixada',
        'de': 'Tieflader'
      },

      // Business Information
      'business_info_title': {
        'en': 'Business Information',
        'es': 'Información Comercial',
        'pt': 'Informações Comerciais',
        'de': 'Geschäftsinformationen'
      },
      'company_name': {
        'en': 'Company Name',
        'es': 'Nombre de la Empresa',
        'pt': 'Nome da Empresa',
        'de': 'Firmenname'
      },
      'tax_id': {
        'en': 'Tax ID / EIN',
        'es': 'RFC / Número de Identificación Fiscal',
        'pt': 'CNPJ / CPF',
        'de': 'Steuer-ID / Umsatzsteuer-ID'
      },
      'dot_number': {
        'en': 'DOT Number',
        'es': 'Número DOT',
        'pt': 'Número ANTT',
        'de': 'Verkehrsbehörden Nummer'
      },

      // Regional Preferences
      'regional_preferences_title': {
        'en': 'Regional Preferences',
        'es': 'Preferencias Regionales',
        'pt': 'Preferências Regionais',
        'de': 'Regionale Präferenzen'
      },
      'preferred_regions': {
        'en': 'Preferred Operating Regions',
        'es': 'Regiones de Operación Preferidas',
        'pt': 'Regiões de Operação Preferidas',
        'de': 'Bevorzugte Betriebsregionen'
      },
      'home_base': {
        'en': 'Home Base Location',
        'es': 'Ubicación de Base',
        'pt': 'Localização da Base',
        'de': 'Standort der Basis'
      },

      // Regional Options
      'north_america': {
        'en': 'North America',
        'es': 'América del Norte',
        'pt': 'América do Norte',
        'de': 'Nordamerika'
      },
      'central_america': {
        'en': 'Central America',
        'es': 'América Central',
        'pt': 'América Central',
        'de': 'Mittelamerika'
      },
      'european_union': {
        'en': 'European Union',
        'es': 'Unión Europea',
        'pt': 'União Europeia',
        'de': 'Europäische Union'
      },

      // Compliance and Documentation
      'compliance_title': {
        'en': 'Compliance & Documentation',
        'es': 'Cumplimiento y Documentación',
        'pt': 'Conformidade e Documentação',
        'de': 'Compliance & Dokumentation'
      },
      'upload_license': {
        'en': 'Upload Driver License',
        'es': 'Subir Licencia de Conducir',
        'pt': 'Enviar Carteira de Motorista',
        'de': 'Führerschein hochladen'
      },
      'upload_insurance': {
        'en': 'Upload Insurance Certificate',
        'es': 'Subir Certificado de Seguro',
        'pt': 'Enviar Certificado de Seguro',
        'de': 'Versicherungsnachweis hochladen'
      },
      'upload_registration': {
        'en': 'Upload Vehicle Registration',
        'es': 'Subir Registro del Vehículo',
        'pt': 'Enviar Registro do Veículo',
        'de': 'Fahrzeugschein hochladen'
      },

      // Validation Messages
      'required_field': {
        'en': 'This field is required',
        'es': 'Este campo es obligatorio',
        'pt': 'Este campo é obrigatório',
        'de': 'Dieses Feld ist erforderlich'
      },
      'invalid_email': {
        'en': 'Please enter a valid email address',
        'es': 'Por favor ingrese una dirección de correo válida',
        'pt': 'Por favor digite um endereço de email válido',
        'de': 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
      },
      'invalid_phone': {
        'en': 'Please enter a valid phone number',
        'es': 'Por favor ingrese un número de teléfono válido',
        'pt': 'Por favor digite um número de telefone válido',
        'de': 'Bitte geben Sie eine gültige Telefonnummer ein'
      },

      // Action Buttons
      'continue': {
        'en': 'Continue',
        'es': 'Continuar',
        'pt': 'Continuar',
        'de': 'Weiter'
      },
      'back': {
        'en': 'Back',
        'es': 'Atrás',
        'pt': 'Voltar',
        'de': 'Zurück'
      },
      'complete_registration': {
        'en': 'Complete Registration',
        'es': 'Completar Registro',
        'pt': 'Completar Registro',
        'de': 'Registrierung abschließen'
      },

      // Success Messages
      'registration_complete': {
        'en': 'Registration Complete!',
        'es': '¡Registro Completado!',
        'pt': 'Registro Concluído!',
        'de': 'Registrierung Abgeschlossen!'
      },
      'welcome_aboard': {
        'en': 'Welcome aboard! Your account is being activated.',
        'es': '¡Bienvenido a bordo! Tu cuenta está siendo activada.',
        'pt': 'Bem-vindo a bordo! Sua conta está sendo ativada.',
        'de': 'Willkommen an Bord! Ihr Konto wird aktiviert.'
      }
    };
  }

  private initializeOnboardingSteps() {
    const steps: OnboardingStep[] = [
      // Step 1: Language Selection & Welcome
      {
        id: 'language_selection',
        title: {
          'en': 'Select Your Language',
          'es': 'Selecciona tu Idioma',
          'pt': 'Selecione seu Idioma',
          'de': 'Wählen Sie Ihre Sprache'
        },
        description: {
          'en': 'Choose your preferred language for the onboarding process',
          'es': 'Elige tu idioma preferido para el proceso de registro',
          'pt': 'Escolha seu idioma preferido para o processo de cadastro',
          'de': 'Wählen Sie Ihre bevorzugte Sprache für den Anmeldeprozess'
        },
        fields: [
          {
            id: 'language',
            type: 'select',
            label: {
              'en': 'Language',
              'es': 'Idioma',
              'pt': 'Idioma',
              'de': 'Sprache'
            },
            placeholder: {
              'en': 'Select a language',
              'es': 'Selecciona un idioma',
              'pt': 'Selecione um idioma',
              'de': 'Wählen Sie eine Sprache'
            },
            options: [
              { value: 'en', label: { 'en': 'English', 'es': 'Inglés', 'pt': 'Inglês', 'de': 'Englisch' } },
              { value: 'es', label: { 'en': 'Spanish', 'es': 'Español', 'pt': 'Espanhol', 'de': 'Spanisch' } },
              { value: 'pt', label: { 'en': 'Portuguese', 'es': 'Portugués', 'pt': 'Português', 'de': 'Portugiesisch' } },
              { value: 'de', label: { 'en': 'German', 'es': 'Alemán', 'pt': 'Alemão', 'de': 'Deutsch' } }
            ],
            required: true
          }
        ],
        validation: [
          {
            field: 'language',
            rule: 'required',
            message: {
              'en': 'Please select a language',
              'es': 'Por favor selecciona un idioma',
              'pt': 'Por favor selecione um idioma',
              'de': 'Bitte wählen Sie eine Sprache'
            }
          }
        ],
        order: 1
      },

      // Step 2: Personal Information
      {
        id: 'personal_info',
        title: this.translations['personal_info_title'],
        description: {
          'en': 'Tell us about yourself',
          'es': 'Cuéntanos sobre ti',
          'pt': 'Conte-nos sobre você',
          'de': 'Erzählen Sie uns von sich'
        },
        fields: [
          {
            id: 'firstName',
            type: 'text',
            label: this.translations['first_name'],
            placeholder: this.translations['first_name'],
            required: true
          },
          {
            id: 'lastName',
            type: 'text',
            label: this.translations['last_name'],
            placeholder: this.translations['last_name'],
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: this.translations['email_address'],
            placeholder: this.translations['email_address'],
            required: true
          },
          {
            id: 'phone',
            type: 'phone',
            label: this.translations['phone_number'],
            placeholder: this.translations['phone_number'],
            required: true
          }
        ],
        validation: [
          {
            field: 'firstName',
            rule: 'required',
            message: this.translations['required_field']
          },
          {
            field: 'lastName',
            rule: 'required',
            message: this.translations['required_field']
          },
          {
            field: 'email',
            rule: 'email',
            message: this.translations['invalid_email']
          },
          {
            field: 'phone',
            rule: 'phone',
            message: this.translations['invalid_phone']
          }
        ],
        order: 2
      },

      // Step 3: Driver Information
      {
        id: 'driver_info',
        title: this.translations['driver_info_title'],
        description: {
          'en': 'Your professional driving details',
          'es': 'Detalles de tu experiencia profesional',
          'pt': 'Detalhes da sua experiência profissional',
          'de': 'Ihre beruflichen Fahrerdetails'
        },
        fields: [
          {
            id: 'cdlNumber',
            type: 'text',
            label: this.translations['cdl_number'],
            placeholder: this.translations['cdl_number'],
            required: true
          },
          {
            id: 'experienceYears',
            type: 'select',
            label: this.translations['experience_years'],
            placeholder: this.translations['experience_years'],
            options: [
              { value: '0-1', label: { 'en': '0-1 years', 'es': '0-1 años', 'pt': '0-1 anos', 'de': '0-1 Jahre' } },
              { value: '2-5', label: { 'en': '2-5 years', 'es': '2-5 años', 'pt': '2-5 anos', 'de': '2-5 Jahre' } },
              { value: '6-10', label: { 'en': '6-10 years', 'es': '6-10 años', 'pt': '6-10 anos', 'de': '6-10 Jahre' } },
              { value: '11+', label: { 'en': '11+ years', 'es': '11+ años', 'pt': '11+ anos', 'de': '11+ Jahre' } }
            ],
            required: true
          },
          {
            id: 'equipmentType',
            type: 'select',
            label: this.translations['equipment_type'],
            placeholder: this.translations['equipment_type'],
            options: [
              { value: 'dry_van', label: this.translations['dry_van'] },
              { value: 'refrigerated', label: this.translations['refrigerated'] },
              { value: 'flatbed', label: this.translations['flatbed'] },
              { value: 'step_deck', label: this.translations['step_deck'] }
            ],
            required: true
          }
        ],
        validation: [
          {
            field: 'cdlNumber',
            rule: 'required',
            message: this.translations['required_field']
          },
          {
            field: 'experienceYears',
            rule: 'required',
            message: this.translations['required_field']
          },
          {
            field: 'equipmentType',
            rule: 'required',
            message: this.translations['required_field']
          }
        ],
        order: 3
      },

      // Step 4: Regional Preferences
      {
        id: 'regional_preferences',
        title: this.translations['regional_preferences_title'],
        description: {
          'en': 'Where would you like to operate?',
          'es': '¿Dónde te gustaría operar?',
          'pt': 'Onde você gostaria de operar?',
          'de': 'Wo möchten Sie tätig sein?'
        },
        fields: [
          {
            id: 'preferredRegions',
            type: 'checkbox',
            label: this.translations['preferred_regions'],
            placeholder: this.translations['preferred_regions'],
            options: [
              { value: 'north_america', label: this.translations['north_america'] },
              { value: 'central_america', label: this.translations['central_america'] },
              { value: 'european_union', label: this.translations['european_union'] }
            ],
            required: true
          },
          {
            id: 'homeBase',
            type: 'text',
            label: this.translations['home_base'],
            placeholder: {
              'en': 'City, State/Province',
              'es': 'Ciudad, Estado/Provincia',
              'pt': 'Cidade, Estado/Província',
              'de': 'Stadt, Bundesland/Provinz'
            },
            required: true
          }
        ],
        validation: [
          {
            field: 'preferredRegions',
            rule: 'required',
            message: this.translations['required_field']
          },
          {
            field: 'homeBase',
            rule: 'required',
            message: this.translations['required_field']
          }
        ],
        order: 4
      },

      // Step 5: Business Information
      {
        id: 'business_info',
        title: this.translations['business_info_title'],
        description: {
          'en': 'Business and compliance details',
          'es': 'Detalles comerciales y de cumplimiento',
          'pt': 'Detalhes comerciais e de conformidade',
          'de': 'Geschäfts- und Compliance-Details'
        },
        fields: [
          {
            id: 'companyName',
            type: 'text',
            label: this.translations['company_name'],
            placeholder: this.translations['company_name'],
            required: false
          },
          {
            id: 'taxId',
            type: 'text',
            label: this.translations['tax_id'],
            placeholder: this.translations['tax_id'],
            required: true
          },
          {
            id: 'dotNumber',
            type: 'text',
            label: this.translations['dot_number'],
            placeholder: this.translations['dot_number'],
            required: true
          }
        ],
        validation: [
          {
            field: 'taxId',
            rule: 'required',
            message: this.translations['required_field']
          },
          {
            field: 'dotNumber',
            rule: 'required',
            message: this.translations['required_field']
          }
        ],
        order: 5
      },

      // Step 6: Document Upload
      {
        id: 'document_upload',
        title: this.translations['compliance_title'],
        description: {
          'en': 'Upload required documents for verification',
          'es': 'Sube los documentos requeridos para verificación',
          'pt': 'Envie os documentos necessários para verificação',
          'de': 'Laden Sie erforderliche Dokumente zur Verifizierung hoch'
        },
        fields: [
          {
            id: 'driverLicense',
            type: 'file',
            label: this.translations['upload_license'],
            placeholder: this.translations['upload_license'],
            required: true
          },
          {
            id: 'insurance',
            type: 'file',
            label: this.translations['upload_insurance'],
            placeholder: this.translations['upload_insurance'],
            required: true
          },
          {
            id: 'vehicleRegistration',
            type: 'file',
            label: this.translations['upload_registration'],
            placeholder: this.translations['upload_registration'],
            required: true
          }
        ],
        validation: [
          {
            field: 'driverLicense',
            rule: 'required',
            message: this.translations['required_field']
          },
          {
            field: 'insurance',
            rule: 'required',
            message: this.translations['required_field']
          },
          {
            field: 'vehicleRegistration',
            rule: 'required',
            message: this.translations['required_field']
          }
        ],
        order: 6
      }
    ];

    steps.forEach(step => {
      this.onboardingSteps.set(step.id, step);
    });
  }

  private initializeRegionalRequirements() {
    const requirements: RegionalRequirements[] = [
      {
        region: 'north_america',
        requiredDocuments: ['cdl', 'dot_medical', 'insurance', 'vehicle_registration'],
        complianceSteps: ['dot_registration', 'usdot_number', 'mc_authority'],
        localizations: {
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          phoneFormat: '+1 (XXX) XXX-XXXX',
          addressFormat: ['street', 'city', 'state', 'zipCode', 'country']
        }
      },
      {
        region: 'central_america',
        requiredDocuments: ['cdl', 'passport', 'insurance', 'vehicle_registration', 'cafta_permit'],
        complianceSteps: ['local_transport_license', 'cross_border_permit', 'customs_clearance'],
        localizations: {
          currency: 'USD',
          dateFormat: 'DD/MM/YYYY',
          phoneFormat: '+XXX XXXX-XXXX',
          addressFormat: ['street', 'city', 'state', 'country', 'postalCode']
        }
      },
      {
        region: 'european_union',
        requiredDocuments: ['eu_driving_license', 'cpc_certificate', 'insurance', 'vehicle_registration', 'tachograph_card'],
        complianceSteps: ['eu_license_recognition', 'cabotage_permit', 'emission_compliance'],
        localizations: {
          currency: 'EUR',
          dateFormat: 'DD.MM.YYYY',
          phoneFormat: '+XX XXX XXX XXXX',
          addressFormat: ['street', 'city', 'postalCode', 'country']
        }
      }
    ];

    requirements.forEach(req => {
      this.regionalRequirements.set(req.region, req);
    });
  }

  /**
   * Start onboarding process for a new user
   */
  public startOnboarding(userId: string, initialLanguage: string = 'en'): OnboardingProgress {
    const progress: OnboardingProgress = {
      userId,
      currentStep: 1,
      completedSteps: [],
      language: initialLanguage,
      region: 'north_america', // default
      userData: {},
      startedAt: new Date(),
      lastUpdated: new Date(),
      status: 'in_progress'
    };

    this.userProgress.set(userId, progress);
    console.log(`🌍 Started multilingual onboarding for user ${userId} in ${initialLanguage}`);
    
    return progress;
  }

  /**
   * Get onboarding steps for a specific language
   */
  public getOnboardingSteps(language: string = 'en'): OnboardingStep[] {
    return Array.from(this.onboardingSteps.values())
      .sort((a, b) => a.order - b.order)
      .map(step => ({
        ...step,
        title: step.title,
        description: step.description,
        fields: step.fields.map(field => ({
          ...field,
          label: field.label,
          placeholder: field.placeholder,
          helpText: field.helpText,
          options: field.options?.map(option => ({
            ...option,
            label: option.label
          }))
        }))
      }));
  }

  /**
   * Update user progress and data
   */
  public updateProgress(
    userId: string, 
    stepId: string, 
    stepData: Record<string, any>
  ): { success: boolean; nextStep?: OnboardingStep; message: string } {
    const progress = this.userProgress.get(userId);
    if (!progress) {
      return { success: false, message: 'Onboarding not found' };
    }

    const step = this.onboardingSteps.get(stepId);
    if (!step) {
      return { success: false, message: 'Invalid step' };
    }

    // Validate step data
    const validation = this.validateStepData(step, stepData, progress.language);
    if (!validation.isValid) {
      return { success: false, message: validation.errors.join(', ') };
    }

    // Update progress
    progress.userData = { ...progress.userData, ...stepData };
    progress.completedSteps.push(stepId);
    progress.lastUpdated = new Date();

    // Update language if changed
    if (stepData.language) {
      progress.language = stepData.language;
    }

    // Determine region based on user selections
    if (stepData.preferredRegions) {
      const regions = Array.isArray(stepData.preferredRegions) 
        ? stepData.preferredRegions 
        : [stepData.preferredRegions];
      
      if (regions.includes('central_america')) {
        progress.region = 'central_america';
      } else if (regions.includes('european_union')) {
        progress.region = 'european_union';
      } else {
        progress.region = 'north_america';
      }
    }

    // Get next step
    const allSteps = this.getOnboardingSteps(progress.language);
    const currentStepIndex = allSteps.findIndex(s => s.id === stepId);
    const nextStep = allSteps[currentStepIndex + 1];

    if (!nextStep) {
      // Onboarding complete
      progress.status = 'completed';
      console.log(`✅ Onboarding completed for user ${userId} in ${progress.language}`);
      return { 
        success: true, 
        message: this.getTranslation('registration_complete', progress.language) 
      };
    }

    progress.currentStep = nextStep.order;
    this.userProgress.set(userId, progress);

    return { 
      success: true, 
      nextStep, 
      message: this.getTranslation('continue', progress.language) 
    };
  }

  /**
   * Validate step data against rules
   */
  private validateStepData(
    step: OnboardingStep, 
    data: Record<string, any>, 
    language: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of step.validation) {
      const value = data[rule.field];
      
      switch (rule.rule) {
        case 'required':
          if (!value || (Array.isArray(value) && value.length === 0)) {
            errors.push(this.getTranslation(rule.message, language) || `${rule.field} is required`);
          }
          break;
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(this.getTranslation(rule.message, language) || 'Invalid email format');
          }
          break;
        case 'phone':
          if (value && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value)) {
            errors.push(this.getTranslation(rule.message, language) || 'Invalid phone format');
          }
          break;
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Get translation for a key and language
   */
  public getTranslation(key: string | Record<string, string>, language: string): string {
    if (typeof key === 'string') {
      return this.translations[key]?.[language] || this.translations[key]?.['en'] || key;
    }
    return key[language] || key['en'] || Object.values(key)[0] || '';
  }

  /**
   * Get user's onboarding progress
   */
  public getProgress(userId: string): OnboardingProgress | null {
    return this.userProgress.get(userId) || null;
  }

  /**
   * Get regional requirements for a specific region
   */
  public getRegionalRequirements(region: string): RegionalRequirements | null {
    return this.regionalRequirements.get(region) || null;
  }

  /**
   * Complete onboarding and create user account
   */
  public async completeOnboarding(userId: string): Promise<{
    success: boolean;
    message: string;
    userData?: any;
  }> {
    const progress = this.userProgress.get(userId);
    if (!progress || progress.status !== 'completed') {
      return { success: false, message: 'Onboarding not completed' };
    }

    // Here you would integrate with user creation system
    console.log(`🎉 Creating user account for ${userId} with data:`, progress.userData);
    console.log(`📍 Region: ${progress.region}, Language: ${progress.language}`);

    return {
      success: true,
      message: this.getTranslation('welcome_aboard', progress.language),
      userData: progress.userData
    };
  }

  /**
   * Get onboarding analytics
   */
  public getOnboardingAnalytics(): {
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
    languageBreakdown: Record<string, number>;
    regionBreakdown: Record<string, number>;
    avgCompletionTime: number;
  } {
    const allProgress = Array.from(this.userProgress.values());
    const completed = allProgress.filter(p => p.status === 'completed');
    
    const languageBreakdown: Record<string, number> = {};
    const regionBreakdown: Record<string, number> = {};
    let totalCompletionTime = 0;

    allProgress.forEach(progress => {
      languageBreakdown[progress.language] = (languageBreakdown[progress.language] || 0) + 1;
      regionBreakdown[progress.region] = (regionBreakdown[progress.region] || 0) + 1;
      
      if (progress.status === 'completed') {
        totalCompletionTime += progress.lastUpdated.getTime() - progress.startedAt.getTime();
      }
    });

    return {
      totalStarted: allProgress.length,
      totalCompleted: completed.length,
      completionRate: allProgress.length > 0 ? (completed.length / allProgress.length) * 100 : 0,
      languageBreakdown,
      regionBreakdown,
      avgCompletionTime: completed.length > 0 ? totalCompletionTime / completed.length : 0
    };
  }
}

// Export singleton instance
export const multilingualOnboarding = new MultilingualOnboardingSystem();